
"use client";
import React from 'react';
import { useStateContext } from '@/app/lib/state';
import { initiateCheckout } from '@/app/lib/actions';
import { pricingTiers } from './data';
import { Icon } from './Icon';

export default function PricingPage() {
    const { state, dispatch } = useStateContext();
    const { pricingPeriod, userTier, emailCapture, emailGateCompleted } = state;

    const handleSubscribe = (priceId: string) => {
        if (!emailGateCompleted) {
             dispatch({type: 'SET_PAGE', payload: 'healthCheck' });
             dispatch({type: 'ADD_TOAST', payload: {id: Date.now(), message: 'Please complete the free health check first!', type: 'info'}});
             return;
        }
        initiateCheckout(dispatch, priceId, 'subscription', emailCapture.email);
    };

    return (
        <div className="pricing-container" style={{width: '100%'}}>
            <div className="wizard-header">
                <h2>Simple, Transparent Pricing</h2>
                <p className="subtle-text">Choose the plan that's right for your business. Cancel anytime.</p>
            </div>
            <div className="pricing-toggle-container">
                <span className={`price-period-label ${pricingPeriod === 'monthly' ? 'active' : ''}`}>Monthly</span>
                <label className="toggle-switch" aria-label="Toggle between monthly and annual pricing">
                    <input type="checkbox" checked={pricingPeriod === 'annual'} onChange={() => dispatch({ type: 'SET_PRICING_PERIOD', payload: pricingPeriod === 'monthly' ? 'annual' : 'monthly' })} />
                    <span className="slider" />
                </label>
                <span className={`price-period-label ${pricingPeriod === 'annual' ? 'active' : ''}`}>Annual (Save ~17%)</span>
            </div>
            <div className="pricing-grid">
                {Object.entries(pricingTiers).map(([key, tier]) => {
                    const isCurrentPlan = userTier === key;
                    const price = tier.price[pricingPeriod] ?? tier.price.monthly;
                    const priceId = tier.priceId[pricingPeriod] ?? tier.priceId.monthly;
                    const isPopular = tier.popular && pricingPeriod === 'annual';

                    return (
                        <div key={key} className={`pricing-card ${isPopular ? 'popular' : ''}`}>
                            {isPopular && <div className="popular-badge">Best Value</div>}
                            <h3>{tier.name}</h3>
                            <div className="price-info">
                                <span className="price-amount">{tier.price.monthly === 0 ? 'Free' : `$${price}`}</span>
                                {tier.price.monthly !== 0 && <span className="price-term">{pricingPeriod === 'monthly' ? '/mo' : '/yr'}</span>}
                            </div>
                            <p className="price-desc">
                                {key === 'essentials' && pricingPeriod === 'annual' ? 'Save $98 compared to monthly!' :
                                 key === 'pro' && pricingPeriod === 'annual' ? 'Save $198 compared to monthly!' : ' '}
                            </p>
                            <ul className="features-list">
                                {tier.features.map((feature, i) => {
                                    const isComingSoon = feature.includes('AI Contract Review');
                                    return (
                                        <li key={i}>
                                            <Icon name="checkmark" />
                                            <span>{feature}</span>
                                            {isComingSoon && <span className="coming-soon-tag">BETA</span>}
                                        </li>
                                    );
                                })}
                            </ul>
                            <button
                                className={`btn ${key === 'free' || isCurrentPlan ? 'btn-secondary' : 'btn-primary'}`}
                                data-tier={key}
                                disabled={key === 'free' || isCurrentPlan}
                                onClick={() => priceId && handleSubscribe(priceId)}
                            >
                                {isCurrentPlan ? 'Current Plan' : (key === 'free' ? 'Included' : 'Get Started')}
                            </button>
                        </div>
                    );
                })}
            </div>
            <p className="value-anchor">All plans are a fraction of the cost of a single hour with a lawyer.</p>
        </div>
    );
}
