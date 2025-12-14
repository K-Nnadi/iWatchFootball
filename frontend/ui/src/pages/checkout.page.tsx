import {
    Box,
    Container,
    Title,
    SimpleGrid,
} from '@mantine/core';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { usePageTransition } from '../hooks/usePageTransition';
import { useAuthStore } from '../shared/stores/auth.store';
import { useCartStore } from '../shared/stores/cart.store';
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

    useEffect(() => {
        // TODO: Replace with actual API call
        // const fetchProviders = async () => {
        //     const response = await fetch('/api/paymentProvider?enabled=true');
        //     const data = await response.json();
        //     setPaymentProviders(data);
        //     setLoading(false);
        // };
        // fetchProviders();

        // Mock data for now
        setTimeout(() => {
            setPaymentProviders([
                {
                    id: 1,
                    name: 'Stripe',
                    slug: 'stripe',
                    type: 'CARD',
                    logoUrl: '/logos/stripe.svg',
                },
                {
                    id: 2,
                    name: 'PayPal',
                    slug: 'paypal',
                    type: 'WALLET',
                    logoUrl: '/logos/paypal.svg',
                },
            ]);
            setLoading(false);
        }, 500);
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

    // Initialize cart on mount
    useEffect(() => {
        if (!hasInitialized.current) {
            initializeCart();
            hasInitialized.current = true;
        }
    }, [initializeCart]);

    // Save ticket to cart when arriving from seat selection
    useEffect(() => {
        if (location.state && ticketDetailsFromState) {
            addItem(ticketDetailsFromState);
            // Start reservation when ticket is added
            if (!checkoutState?.reservationStartTime) {
                startReservation();
            }
        }
    }, [location.state, ticketDetailsFromState, addItem, startReservation, checkoutState?.reservationStartTime]);

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

    // Redirect if no ticket details available
    if (!ticketDetailsFromState) {
        console.error('No ticket details available. Redirecting to matches page.');
        navigateWithTransition('/matches');
        return null;
    }

    const ticketDetails = ticketDetailsFromState;

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

        if (selectedProvider.type === 'CARD') {
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

        setPaymentStatus('idle');
        setTimeout(() => {
            const isSuccessful = Math.random() > 0.1;
            if (isSuccessful) {
                setPaymentStatus('success');
                // Clear cart and checkout state on successful payment
                clearCart();
                clearCheckoutState();
                setTimeout(
                    () =>
                        navigateWithTransition('/thank-you', {
                            transitionType: 'loading',
                            duration: 1200,
                        }),
                    2000,
                );
            } else {
                setPaymentStatus('error');
            }
        }, 1500);
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
                initialMinutes={15}
                reservationStartTime={checkoutState?.reservationStartTime ?? null}
                onExpire={() => {
                    // Clear checkout state when reservation expires
                    clearCheckoutState();
                    console.warn('Reservation expired');
                    // Optionally redirect to matches page
                    // navigateWithTransition('/matches');
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
                        <PaymentStep
                            paymentProviders={paymentProviders}
                            selectedProvider={selectedProvider}
                            paymentInfo={paymentInfo}
                            errors={errors}
                            loading={loading}
                            paymentStatus={paymentStatus}
                            ticketDetails={ticketDetails}
                            onProviderSelect={setSelectedProvider}
                            onPaymentInfoChange={handleInputChange}
                            onBack={handleBack}
                            onPaymentSubmit={handlePaymentSubmit}
                            onPaymentStatusChange={setPaymentStatus}
                        />
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
