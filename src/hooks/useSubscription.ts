// src/hooks/useSubscription.ts
import { useState, useEffect, createContext, useContext } from 'react';
import * as InAppPurchases from 'expo-in-app-purchases';
import * as SecureStore from 'expo-secure-store';

const SUBSCRIPTION_PRODUCT_ID = 'com.tsglobal.soundscape.premium_monthly';
const STORE_KEY = 'isPremium';

interface SubscriptionContextType {
    isPremium: boolean;
    buySubscription(): Promise<void>;
    restorePurchases(): Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
    isPremium: false,
    buySubscription: async () => { },
    restorePurchases: async () => { },
});

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
    const [isPremium, setIsPremium] = useState(false);

    // Load persisted state
    useEffect(() => {
        SecureStore.getItemAsync(STORE_KEY).then(val => {
            if (val === 'true') setIsPremium(true);
        });
    }, []);

    // Connect to IAP
    useEffect(() => {
        InAppPurchases.connectAsync();
        InAppPurchases.getProductsAsync([SUBSCRIPTION_PRODUCT_ID]);
        const sub = InAppPurchases.setPurchaseListener(async ({ responseCode, results }) => {
            for (const purchase of results) {
                if (purchase.productId === SUBSCRIPTION_PRODUCT_ID && responseCode === InAppPurchases.IAPResponseCode.OK) {
                    // Grant premium
                    await SecureStore.setItemAsync(STORE_KEY, 'true');
                    setIsPremium(true);
                    // Finish the transaction
                    await InAppPurchases.finishTransactionAsync(purchase, false);
                }
            }
        });
        return () => {
            sub.remove();
            InAppPurchases.disconnectAsync();
        };
    }, []);

    async function buySubscription() {
        await InAppPurchases.purchaseItemAsync(SUBSCRIPTION_PRODUCT_ID);
    }

    async function restorePurchases() {
        await InAppPurchases.getPurchaseHistoryAsync();  // triggers listener
    }

    return (
        <SubscriptionContext.Provider value= {{ isPremium, buySubscription, restorePurchases }}>
            { children }
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    return useContext(SubscriptionContext);
}
