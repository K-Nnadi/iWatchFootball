import {
    Alert,
    Box,
    Badge,
    Button,
    Container,
    Group,
    Paper,
    Text,
    TextInput,
    Title,
    SimpleGrid,
} from '@mantine/core';
import { IconTag, IconX } from '@tabler/icons-react';
import { notify } from '../shared/notify';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { usePageTransition } from '../hooks/usePageTransition';
import { useAuthStore } from '../shared/stores/auth.store';
import { useCartStore } from '../shared/stores/cart.store';
import { releaseTicketHold, verifyTicketHold } from '../shared/api/ticketHold.api';
import { confirmCheckout } from '../shared/api/checkout.api';
import { confirmMarketplacePurchase } from '../shared/api/marketplace.api';
import { getMyCredit } from '../shared/api/wallet.api';
import { validateDiscountCode } from '../shared/api/discountCode.api';
import { AuthenticationStep } from './checkout/AuthenticationStep';
import { DetailsStep } from './checkout/DetailsStep';
import { AdditionalInfoStep } from './checkout/AdditionalInfoStep';
import { PaymentStep } from './checkout/PaymentStep';
import { OrderSummary } from './checkout/OrderSummary';
import { ReservationTimer } from './checkout/ReservationTimer';
import { CheckoutStepper } from './checkout/CheckoutStepper';
import {
    CheckoutTicketDetails,
    PaymentProvider,
    UserDetails,
    AdditionalInfo,
    PaymentInfo,
    CheckoutErrors,
} from './checkout/types';

export function CheckoutPage() {
    const location = useLocation();
    const { navigateWithTransition } = usePageTransition();
    const { isLoggedIn } = useAuthStore();
    const {
        items,
        addItem,
        checkoutState,
        setCheckoutState,
        startReservation,
        initializeCart,
        clearCart,
        clearCheckoutState,
    } = useCartStore();
    const hasInitialized = useRef(false);
    
    // Get ticket details from location.state or from cart
    const getTicketDetails = (): CheckoutTicketDetails | null => {
        if (location.state) {
            return location.state as CheckoutTicketDetails;
        }
        // Try to get from cart (use first item if available)
        if (items.length > 0) {
            const cartItem = items[0];
            // Return ticket details without cart-specific fields
            return {
                matchId: cartItem.matchId,
                homeTeam: cartItem.homeTeam,
                awayTeam: cartItem.awayTeam,
                date: cartItem.date,
                venue: cartItem.venue,
                price: cartItem.price,
                competition: cartItem.competition,
                section: cartItem.section,
                row: cartItem.row,
                fanSide: cartItem.fanSide,
                seatsTogether: cartItem.seatsTogether,
                ticketType: cartItem.ticketType,
                unrestrictedView: cartItem.unrestrictedView,
                quantity: cartItem.quantity,
                imageUrl: cartItem.imageUrl,
                fixtureId: cartItem.fixtureId,
                offerKey: cartItem.offerKey,
                holderId: cartItem.holderId,
                holdExpiresAt: cartItem.holdExpiresAt,
                category: cartItem.category,
            };
        }
        return null;
    };

    const ticketDetailsFromState = getTicketDetails();
    
    // Use normalized step indices: 0=Auth, 1=Details, 2=Additional, 3=Payment
    // When logged in, we skip step 0 (auth) but keep the same internal numbering
    const [activeStep, setActiveStep] = useState(() => {
        if (checkoutState) {
            return checkoutState.activeStep;
        }
        return isLoggedIn ? 1 : 0;
    });
    const [isGuestCheckout, setIsGuestCheckout] = useState(() => {
        return checkoutState?.isGuestCheckout ?? false;
    });
    
    // Handle stepper click - convert stepper step back to internal step
    const handleStepperClick = (stepperStep: number) => {
        if (isLoggedIn) {
            // Convert stepper step (0,1,2) to internal step (1,2,3)
            setActiveStep(stepperStep + 1);
        } else {
            // Steps match directly
            setActiveStep(stepperStep);
        }
    };

    const [paymentProviders, setPaymentProviders] = useState<PaymentProvider[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
    const [loading, setLoading] = useState(true);

    // Discount code state
    const [discountCodeInput, setDiscountCodeInput] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<{
        discountCodeId: number;
        discountAmount: number;
        label: string;
    } | null>(null);
    const [discountError, setDiscountError] = useState('');
    const [applyingDiscount, setApplyingDiscount] = useState(false);

    useEffect(() => {
        void (async () => {
            const credit = await getMyCredit();
            const creditBalance = Number(credit?.balance ?? 0);
            setPaymentProviders([
                {
                    id: 1,
                    name: 'Stripe',
                    slug: 'stripe',
                    type: 'CARD',
                    logoUrl: '/logos/stripe.png',
                },
                {
                    id: 2,
                    name: 'PayPal',
                    slug: 'paypal',
                    type: 'WALLET',
                    logoUrl: '/logos/paypal.png',
                },
                {
                    id: 999,
                    name: `Platform Credit (£${creditBalance.toFixed(2)} available)`,
                    slug: 'platform-credit',
                    type: 'CREDIT',
                    creditBalance,
                },
            ]);
            setLoading(false);
        })();
    }, []);

    // Step 1: Your Details
    const [userDetails, setUserDetails] = useState<UserDetails>(() => {
        return checkoutState?.userDetails ?? {
            email: '',
            confirmEmail: '',
            phone: '',
            phoneCountryCode: '+44',
            firstName: '',
            lastName: '',
            address: '',
            addressLine2: '',
            postcode: '',
            townCity: '',
            country: 'United Kingdom',
            regionState: '',
            addressType: 'Personal',
        };
    });

    // Step 2: Additional Information
    const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo>(() => {
        return checkoutState?.additionalInfo ?? {
            agreeToTerms: false,
            agreeToMarketing: false,
        };
    });

    // Step 3: Payment
    const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>(() => {
        return checkoutState?.paymentInfo ?? {
            name: '',
            cardNumber: '',
            expiration: '',
            cvv: '',
            email: '',
        };
    });

    const [errors, setErrors] = useState<CheckoutErrors>({
        email: '',
        confirmEmail: '',
        phone: '',
        firstName: '',
        lastName: '',
        address: '',
        postcode: '',
        townCity: '',
        country: '',
        name: '',
        cardNumber: '',
        expiration: '',
        cvv: '',
        agreeToTerms: '',
    });

    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    const [cartReady, setCartReady] = useState(false);

    // Initialize cart on mount
    useEffect(() => {
        if (!hasInitialized.current) {
            initializeCart();
            hasInitialized.current = true;
        }
        setCartReady(true);
    }, [initializeCart]);

    // Merge navigation state into cart once (seat selection may have already added the same hold)
    useEffect(() => {
        if (!location.state || !ticketDetailsFromState) {
            return;
        }
        const t = ticketDetailsFromState;
        const dup =
            t.fixtureId != null &&
            !!t.offerKey &&
            !!t.holderId &&
            items.some(
                (i) =>
                    i.fixtureId === t.fixtureId &&
                    i.offerKey === t.offerKey &&
                    i.holderId === t.holderId,
            );
        if (!dup) {
            addItem(t);
        }
        if (!checkoutState?.reservationStartTime) {
            startReservation();
        }
    }, [
        location.state,
        ticketDetailsFromState,
        items,
        addItem,
        startReservation,
        checkoutState?.reservationStartTime,
    ]);

    // Server-side hold must still be valid (enforced on backend)
    useEffect(() => {
        if (!ticketDetailsFromState) {
            return;
        }
        const t = ticketDetailsFromState;
        if (t.fixtureId == null || !t.offerKey || !t.holderId) {
            return;
        }

        let cancelled = false;
        verifyTicketHold({
            fixtureId: t.fixtureId,
            offerKey: t.offerKey,
            holderId: t.holderId,
        }).catch(() => {
            if (cancelled) {
                return;
            }
            notify.error('Reservation no longer valid', 'This listing is no longer held for you. Returning to matches.');
            clearCart();
            clearCheckoutState();
            navigateWithTransition('/matches');
        });

        return () => {
            cancelled = true;
        };
    }, [
        ticketDetailsFromState?.fixtureId,
        ticketDetailsFromState?.offerKey,
        ticketDetailsFromState?.holderId,
        clearCart,
        clearCheckoutState,
        navigateWithTransition,
    ]);

    // Persist checkout state whenever it changes
    useEffect(() => {
        setCheckoutState({
            activeStep,
            isGuestCheckout,
            userDetails,
            additionalInfo,
            paymentInfo,
        });
    }, [activeStep, isGuestCheckout, userDetails, additionalInfo, paymentInfo, setCheckoutState]);

    // Handle login state changes - if user logs in during checkout, skip auth step
    useEffect(() => {
        if (isLoggedIn && activeStep === 0 && !isGuestCheckout) {
            setActiveStep(1);
        }
    }, [isLoggedIn, activeStep, isGuestCheckout]);

    // Redirect once cart is ready and there are no ticket details
    useEffect(() => {
        if (!cartReady) return;
        if (!ticketDetailsFromState) {
            notify.warning('No ticket selected', 'Your session expired or the ticket is no longer available.');
            navigateWithTransition('/matches');
        }
    }, [cartReady, ticketDetailsFromState, navigateWithTransition]);

    if (!cartReady || !ticketDetailsFromState) return null;

    const ticketDetails = ticketDetailsFromState;

    const checkoutQuantity =
        ticketDetails.quantity ?? ticketDetails.seatsTogether ?? 1;
    const checkoutLineSubtotal = (ticketDetails.price ?? 0) * checkoutQuantity;
    const primaryPayTotal = Math.max(
        0,
        Math.round((checkoutLineSubtotal - (appliedDiscount?.discountAmount ?? 0)) * 100) / 100,
    );
    const payAmountDue = ticketDetails.listingId != null ? checkoutLineSubtotal : primaryPayTotal;

    const validateStep1 = () => {
        let valid = true;
        const newErrors: CheckoutErrors = {
            ...errors,
            email: '',
            confirmEmail: '',
            phone: '',
            firstName: '',
            lastName: '',
            address: '',
            postcode: '',
            townCity: '',
        };

        const emailRegex = /^\S+@\S+$/;
        if (!emailRegex.test(userDetails.email)) {
            newErrors.email = 'Valid email is required';
            valid = false;
        }

        if (userDetails.email !== userDetails.confirmEmail) {
            newErrors.confirmEmail = 'Emails do not match';
            valid = false;
        }

        if (!userDetails.phone.trim()) {
            newErrors.phone = 'Phone number is required';
            valid = false;
        }

        if (!userDetails.firstName.trim()) {
            newErrors.firstName = 'First name is required';
            valid = false;
        }

        if (!userDetails.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
            valid = false;
        }

        if (!userDetails.address.trim()) {
            newErrors.address = 'Address is required';
            valid = false;
        }

        if (!userDetails.postcode.trim()) {
            newErrors.postcode = 'Postcode is required';
            valid = false;
        }

        if (!userDetails.townCity.trim()) {
            newErrors.townCity = 'Town/City is required';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const validateStep2 = () => {
        let valid = true;
        const newErrors: CheckoutErrors = { ...errors, agreeToTerms: '' };

        if (!additionalInfo.agreeToTerms) {
            newErrors.agreeToTerms = 'You must agree to the Terms and Conditions';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const validateStep3 = () => {
        let valid = true;
        const newErrors: CheckoutErrors = {
            ...errors,
            name: '',
            cardNumber: '',
            expiration: '',
            cvv: '',
            email: '',
        };

        if (!selectedProvider) {
            return false;
        }

        if (selectedProvider.type === 'CREDIT') {
            // No extra fields needed; balance check is done server-side
        } else if (selectedProvider.type === 'CARD') {
            if (!paymentInfo.name.trim()) {
                newErrors.name = 'Name is required';
                valid = false;
            }

            const cardRegex = /^\d{16}$/;
            if (!cardRegex.test(paymentInfo.cardNumber.replace(/\s+/g, ''))) {
                newErrors.cardNumber = 'Card number must be 16 digits';
                valid = false;
            }

            const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
            if (!expiryRegex.test(paymentInfo.expiration)) {
                newErrors.expiration = 'Invalid format (MM/YY)';
                valid = false;
            }

            const cvvRegex = /^\d{3,4}$/;
            if (!cvvRegex.test(paymentInfo.cvv)) {
                newErrors.cvv = 'CVV must be 3 or 4 digits';
                valid = false;
            }
        } else if (selectedProvider.type === 'WALLET') {
            const emailRegex = /^\S+@\S+$/;
            if (!emailRegex.test(paymentInfo.email)) {
                newErrors.email = 'Valid email is required';
                valid = false;
            }
        }

        setErrors(newErrors);
        return valid;
    };

    const handleApplyDiscount = () => {
        if (!discountCodeInput.trim()) return;
        const total = (ticketDetailsFromState?.price ?? 0) * ((ticketDetailsFromState?.quantity ?? ticketDetailsFromState?.seatsTogether) ?? 1);
        setApplyingDiscount(true);
        setDiscountError('');
        void validateDiscountCode(discountCodeInput.trim(), total)
            .then((result) => {
                setAppliedDiscount({
                    discountCodeId: result.discountCodeId,
                    discountAmount: result.discountAmount,
                    label: `${discountCodeInput.toUpperCase()} — saves £${result.discountAmount.toFixed(2)}`,
                });
                setDiscountError('');
            })
            .catch((e: unknown) => {
                const msg =
                    (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                    'Invalid discount code';
                setDiscountError(msg);
                setAppliedDiscount(null);
            })
            .finally(() => setApplyingDiscount(false));
    };

    const handleNext = () => {
        const detailsStep = isLoggedIn ? 0 : 1;
        const additionalInfoStep = isLoggedIn ? 1 : 2;
        const paymentStep = isLoggedIn ? 2 : 3;

        if (activeStep === detailsStep) {
            if (validateStep1()) {
                setActiveStep(additionalInfoStep);
            }
        } else if (activeStep === additionalInfoStep) {
            if (validateStep2()) {
                setActiveStep(paymentStep);
            }
        }
    };

    const handleBack = () => {
        const minStep = isLoggedIn ? 0 : 0;
        setActiveStep((prev) => Math.max(minStep, prev - 1));
    };

    const handlePaymentSubmit = () => {
        if (!validateStep3() || !selectedProvider) return;

        const isMarketplace = ticketDetails.listingId != null;

        if (!isMarketplace && (
            ticketDetails.fixtureId == null ||
            !ticketDetails.offerKey ||
            !ticketDetails.holderId
        )) {
            notify.error('Reservation required', 'Start checkout from seat selection so the server can reserve your tickets.');
            return;
        }

        if (isMarketplace && !ticketDetails.marketplaceHolderId) {
            notify.error(
                'Hold expired',
                'Your reservation expired. Please start again from the marketplace.',
            );
            navigateWithTransition('/marketplace');
            return;
        }

        setPaymentProcessing(true);
        setPaymentStatus('idle');
        setTimeout(() => {
            void (async () => {
                try {
                    let idem = sessionStorage.getItem('iwf_checkout_idem');
                    if (!idem) {
                        idem = crypto.randomUUID();
                        sessionStorage.setItem('iwf_checkout_idem', idem);
                    }
                    const paymentMethod =
                        selectedProvider.type === 'CARD'
                            ? 'CreditCard'
                            : selectedProvider.type === 'CREDIT'
                            ? 'PlatformCredit'
                            : 'PayPal';

                    if (isMarketplace) {
                        await confirmMarketplacePurchase({
                            listingId: ticketDetails.listingId!,
                            holderId: ticketDetails.marketplaceHolderId!,
                            paymentMethod,
                            paymentProviderId: selectedProvider.type !== 'CREDIT' ? selectedProvider.id : undefined,
                            providerPaymentRef: `client_${Date.now()}`,
                            idempotencyKey: idem,
                        });
                    } else {
                        await confirmCheckout({
                            fixtureId: ticketDetails.fixtureId!,
                            offerKey: ticketDetails.offerKey!,
                            holderId: ticketDetails.holderId!,
                            quantity: ticketDetails.quantity ?? ticketDetails.seatsTogether ?? 1,
                            unitPrice: ticketDetails.price,
                            category: ticketDetails.category ?? 'general',
                            paymentMethod,
                            paymentProviderId: selectedProvider.type !== 'CREDIT' ? selectedProvider.id : undefined,
                            providerPaymentRef: `client_${Date.now()}`,
                            idempotencyKey: idem,
                            discountCodeId: appliedDiscount?.discountCodeId,
                        });
                    }

                    setPaymentStatus('success');
                    sessionStorage.removeItem('iwf_checkout_idem');
                    clearCart();
                    clearCheckoutState();
                    setTimeout(
                        () => navigateWithTransition('/thank-you', { transitionType: 'loading', duration: 1200 }),
                        1500,
                    );
                } catch (e: unknown) {
                    setPaymentStatus('error');
                    const msg =
                        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                        (e as Error)?.message ||
                        'Payment could not be completed.';
                    notify.error('Checkout failed', msg);
                } finally {
                    setPaymentProcessing(false);
                }
            })();
        }, 400);
    };

    const handleInputChange = (field: string, value: string) => {
        setPaymentInfo((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleUserDetailsChange = (field: string, value: string) => {
        setUserDetails((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleAdditionalInfoChange = (field: keyof AdditionalInfo, value: boolean) => {
        setAdditionalInfo((prev) => ({ ...prev, [field]: value }));
        if (field === 'agreeToTerms') {
            setErrors((prev) => ({ ...prev, agreeToTerms: '' }));
        }
    };

    return (
        <Container size="lg" my="xl">
            <Title order={2} mb="lg">
                Checkout
            </Title>

            <ReservationTimer
                initialMinutes={10}
                reservationStartTime={checkoutState?.reservationStartTime ?? null}
                holdDeadlineMs={
                    ticketDetails.holdExpiresAt
                        ? new Date(ticketDetails.holdExpiresAt).getTime()
                        : null
                }
                onExpire={() => {
                    void (async () => {
                        if (ticketDetails.holderId) {
                            try {
                                await releaseTicketHold(ticketDetails.holderId);
                            } catch {
                                /* ignore */
                            }
                        }
                        clearCheckoutState();
                        clearCart();
                        navigateWithTransition('/matches');
                    })();
                }}
            />

            <CheckoutStepper
                activeStep={activeStep}
                isLoggedIn={isLoggedIn}
                onStepClick={handleStepperClick}
            />

            <SimpleGrid cols={{ base: 1, md: 2 }} style={{ gap: 'var(--mantine-spacing-xl)' }}>
                {/* Left Panel - Form */}
                <Box>
                    {activeStep === 0 && !isLoggedIn && (
                        <AuthenticationStep
                            onContinueAsGuest={() => {
                                setIsGuestCheckout(true);
                                setActiveStep(1);
                            }}
                        />
                    )}

                    {activeStep === (isLoggedIn ? 0 : 1) && (
                        <DetailsStep
                            userDetails={userDetails}
                            errors={errors}
                            onUserDetailsChange={handleUserDetailsChange}
                            onNext={handleNext}
                        />
                    )}

                    {activeStep === (isLoggedIn ? 1 : 2) && (
                        <AdditionalInfoStep
                            additionalInfo={additionalInfo}
                            errors={errors}
                            onAdditionalInfoChange={handleAdditionalInfoChange}
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    )}

                    {activeStep === (isLoggedIn ? 2 : 3) && (
                        <>
                            {/* Discount code — primary market only */}
                            {!ticketDetails.listingId && (
                                <Paper p="md" radius="md" withBorder mb="md">
                                    <Text fw={500} size="sm" mb="xs">
                                        Discount Code
                                    </Text>
                                    {appliedDiscount ? (
                                        <Group gap="xs">
                                            <Badge
                                                color="teal"
                                                leftSection={<IconTag size={12} />}
                                                rightSection={
                                                    <IconX
                                                        size={12}
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => {
                                                            setAppliedDiscount(null);
                                                            setDiscountCodeInput('');
                                                        }}
                                                    />
                                                }
                                                size="lg"
                                                variant="light"
                                            >
                                                {appliedDiscount.label}
                                            </Badge>
                                        </Group>
                                    ) : (
                                        <>
                                            <Group gap="xs">
                                                <TextInput
                                                    placeholder="Enter code"
                                                    value={discountCodeInput}
                                                    onChange={(e) => {
                                                        setDiscountCodeInput(e.currentTarget.value);
                                                        setDiscountError('');
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleApplyDiscount();
                                                    }}
                                                    style={{ flex: 1 }}
                                                    size="sm"
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={handleApplyDiscount}
                                                    loading={applyingDiscount}
                                                >
                                                    Apply
                                                </Button>
                                            </Group>
                                            {discountError && (
                                                <Alert color="red" mt="xs" p="xs">
                                                    {discountError}
                                                </Alert>
                                            )}
                                        </>
                                    )}
                                </Paper>
                            )}

                            <PaymentStep
                                paymentProviders={paymentProviders}
                                selectedProvider={selectedProvider}
                                paymentInfo={paymentInfo}
                                errors={errors}
                                loading={loading}
                                paymentProcessing={paymentProcessing}
                                paymentStatus={paymentStatus}
                                payAmountDue={payAmountDue}
                                onProviderSelect={setSelectedProvider}
                                onPaymentInfoChange={handleInputChange}
                                onBack={handleBack}
                                onPaymentSubmit={handlePaymentSubmit}
                                onPaymentStatusChange={setPaymentStatus}
                            />
                        </>
                    )}
                </Box>

                {/* Right Panel - Order Summary */}
                <Box>
                    <OrderSummary
                        ticketDetails={ticketDetails}
                        isGuestCheckout={isGuestCheckout}
                    />
                </Box>
            </SimpleGrid>
        </Container>
    );
}
