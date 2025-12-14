import { create } from 'zustand';
import type { CheckoutTicketDetails, UserDetails, AdditionalInfo, PaymentInfo } from '../../pages/checkout/types';

export interface CartItem extends CheckoutTicketDetails {
    id: string; // Unique identifier for the cart item
    addedAt: number; // Timestamp when item was added
}

export interface CheckoutState {
    activeStep: number;
    isGuestCheckout: boolean;
    userDetails: UserDetails;
    additionalInfo: AdditionalInfo;
    paymentInfo: PaymentInfo;
    reservationStartTime: number | null; // Timestamp when reservation started
}

interface CartStore {
    items: CartItem[];
    checkoutState: CheckoutState | null;
    
    // Cart item methods
    addItem: (item: CheckoutTicketDetails) => void;
    removeItem: (itemId: string) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    
    // Checkout state methods
    setCheckoutState: (state: Partial<CheckoutState>) => void;
    clearCheckoutState: () => void;
    startReservation: () => void;
    isReservationExpired: (reservationMinutes?: number) => boolean;
    getRemainingReservationTime: (reservationMinutes?: number) => number; // Returns seconds remaining
    
    // Persistence
    initializeCart: () => void;
}

const RESERVATION_DURATION_MINUTES = 15;
const CART_STORAGE_KEY = 'iwf_cart';
const CHECKOUT_STATE_STORAGE_KEY = 'iwf_checkout_state';

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],
    checkoutState: null,
    
    addItem: (item: CheckoutTicketDetails) => {
        const newItem: CartItem = {
            ...item,
            id: `${item.matchId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            addedAt: Date.now(),
        };
        
        set((state) => {
            const updatedItems = [...state.items, newItem];
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedItems));
            return { items: updatedItems };
        });
    },
    
    removeItem: (itemId: string) => {
        set((state) => {
            const updatedItems = state.items.filter((item) => item.id !== itemId);
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedItems));
            return { items: updatedItems };
        });
    },
    
    clearCart: () => {
        localStorage.removeItem(CART_STORAGE_KEY);
        localStorage.removeItem(CHECKOUT_STATE_STORAGE_KEY);
        set({ items: [], checkoutState: null });
    },
    
    getCartTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
    },
    
    setCheckoutState: (state: Partial<CheckoutState>) => {
        set((current) => {
            const updatedState: CheckoutState = {
                activeStep: state.activeStep ?? current.checkoutState?.activeStep ?? 0,
                isGuestCheckout: state.isGuestCheckout ?? current.checkoutState?.isGuestCheckout ?? false,
                userDetails: state.userDetails ?? current.checkoutState?.userDetails ?? {
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
                },
                additionalInfo: state.additionalInfo ?? current.checkoutState?.additionalInfo ?? {
                    agreeToTerms: false,
                    agreeToMarketing: false,
                },
                paymentInfo: state.paymentInfo ?? current.checkoutState?.paymentInfo ?? {
                    name: '',
                    cardNumber: '',
                    expiration: '',
                    cvv: '',
                    email: '',
                },
                reservationStartTime: state.reservationStartTime ?? current.checkoutState?.reservationStartTime ?? null,
            };
            
            localStorage.setItem(CHECKOUT_STATE_STORAGE_KEY, JSON.stringify(updatedState));
            return { checkoutState: updatedState };
        });
    },
    
    clearCheckoutState: () => {
        localStorage.removeItem(CHECKOUT_STATE_STORAGE_KEY);
        set({ checkoutState: null });
    },
    
    startReservation: () => {
        const { setCheckoutState, checkoutState } = get();
        setCheckoutState({
            reservationStartTime: Date.now(),
            ...checkoutState,
        });
    },
    
    isReservationExpired: (reservationMinutes: number = RESERVATION_DURATION_MINUTES) => {
        const { checkoutState } = get();
        if (!checkoutState?.reservationStartTime) return false;
        
        const elapsed = (Date.now() - checkoutState.reservationStartTime) / 1000 / 60; // minutes
        return elapsed >= reservationMinutes;
    },
    
    getRemainingReservationTime: (reservationMinutes: number = RESERVATION_DURATION_MINUTES) => {
        const { checkoutState } = get();
        if (!checkoutState?.reservationStartTime) return 0;
        
        const elapsed = (Date.now() - checkoutState.reservationStartTime) / 1000; // seconds
        const total = reservationMinutes * 60; // total seconds
        const remaining = Math.max(0, total - elapsed);
        
        return Math.floor(remaining);
    },
    
    initializeCart: () => {
        try {
            const cartData = localStorage.getItem(CART_STORAGE_KEY);
            const checkoutData = localStorage.getItem(CHECKOUT_STATE_STORAGE_KEY);
            
            if (cartData) {
                const items = JSON.parse(cartData) as CartItem[];
                set({ items });
            }
            
            if (checkoutData) {
                const checkoutState = JSON.parse(checkoutData) as CheckoutState;
                // Check if reservation is expired
                const elapsed = checkoutState.reservationStartTime 
                    ? (Date.now() - checkoutState.reservationStartTime) / 1000 / 60
                    : Infinity;
                
                if (elapsed >= RESERVATION_DURATION_MINUTES) {
                    // Reservation expired, clear checkout state but keep cart
                    localStorage.removeItem(CHECKOUT_STATE_STORAGE_KEY);
                    set({ checkoutState: null });
                } else {
                    set({ checkoutState });
                }
            }
        } catch (error) {
            console.error('Failed to initialize cart:', error);
            // Clear corrupted data
            localStorage.removeItem(CART_STORAGE_KEY);
            localStorage.removeItem(CHECKOUT_STATE_STORAGE_KEY);
            set({ items: [], checkoutState: null });
        }
    },
}));
