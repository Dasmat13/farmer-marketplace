# 🤖 AI Recommendations Feature - Testing Guide

## Overview
This comprehensive guide walks you through testing all aspects of the AI Recommendations feature set implemented in the Farmer Marketplace application.

## 🔧 Prerequisites
- Application running at `http://localhost:3000`
- AI service running at `http://localhost:8000` 
- Browser with DevTools access for debugging

## 🧪 Feature Testing Checklist

### 1. Smart Crop Suggestions Testing

#### **Location**: Any Crop Detail Page (e.g., `/crops/tomatoes`, `/crops/corn`)

**Test Steps:**
1. Navigate to a crop detail page
2. Scroll down to the "AI Recommendations" section
3. Wait for recommendations to load (should show loading skeleton first)

**Expected Results:**
- ✅ Loading skeleton appears initially
- ✅ 3-6 recommendation cards display
- ✅ Each card shows: crop name, price, farmer, location, confidence badge
- ✅ Confidence badges: "High Match" (green), "Good Match" (blue), "Fair Match" (orange)
- ✅ Recommendation reasons vary: "Popular in [Category]", "Perfect for [season] season", "Frequently bought with [crop]"
- ✅ Clicking any card navigates to that crop's detail page
- ✅ "View all crops →" link at bottom works

**Advanced Testing:**
```javascript
// Open browser console and test recommendation API directly
console.log('Testing recommendation tracking...');
// Navigate between different crops and verify view tracking
localStorage.getItem('view_history'); // Should show tracked views
```

### 2. Price Prediction & Alerts Testing

#### **Location**: Crop Detail Pages (right side of AI Market Analysis section)

**Test Steps:**
1. Navigate to any crop detail page
2. Locate "Price Prediction" component (next to existing AI predictions)
3. Wait for price prediction to load

**Expected Results:**
- ✅ Current vs Predicted price comparison
- ✅ Trend indicator (up/down/stable arrows)
- ✅ Percentage change calculation
- ✅ Confidence level (70-100%)
- ✅ "7 days" timeframe indicator

**Price Alerts Testing:**
1. Click "Set Alert" button
2. Enter a target price (try both high and low values)
3. Click "Create Alert"

**Expected Results:**
- ✅ Form appears with price input
- ✅ Success message shows when alert created
- ✅ Alert appears in "Active Alerts" section
- ✅ Alert data persists in localStorage
- ✅ Validation prevents invalid prices

### 3. Seasonal Recommendations Testing

#### **Locations**: Home Page & Buyer Dashboard

**Home Page Testing:**
1. Navigate to home page (`/`)
2. Scroll to "🌱 Fresh Seasonal Picks" section

**Expected Results:**
- ✅ Section shows current season (Spring/Summer/Fall/Winter)
- ✅ 4 seasonal crop cards display
- ✅ Cards have green gradient styling
- ✅ "Peak Season" badges visible
- ✅ Prices and farmer info shown
- ✅ Links navigate to crop detail pages

**Buyer Dashboard Testing:**
1. Log in as buyer (register if needed)
2. Navigate to buyer dashboard
3. Scroll to "Seasonal Recommendations for You" section

**Expected Results:**
- ✅ Personalized seasonal recommendations
- ✅ Same styling as home page
- ✅ Proper integration with dashboard layout

### 4. Notifications System Testing

#### **Location**: Global (appears top-right when alerts trigger)

**Setup for Testing:**
1. Create a price alert with a high target price (e.g., $10 for tomatoes)
2. Wait 5-10 seconds (system checks every 5 seconds)

**Current Limitation**: For demo purposes, the notification system uses mock data. In a production environment, this would trigger when actual prices drop.

**Expected Results:**
- ✅ Notification panel appears top-right
- ✅ Shows count of triggered alerts
- ✅ Individual alert cards with crop name, target vs current price
- ✅ "Target reached!" badge with timestamp
- ✅ Individual dismiss (X) buttons work
- ✅ "Dismiss All" clears all notifications
- ✅ "View Crops →" link navigates correctly

### 5. User Behavior Tracking Testing

**View Tracking:**
1. Visit several crop detail pages
2. Open browser console
3. Check localStorage: `localStorage.getItem('view_history')`

**Expected Results:**
- ✅ JSON array with view records
- ✅ Each record has: cropId, userId, timestamp
- ✅ Recent views influence recommendations

**Purchase Simulation:**
```javascript
// Simulate a purchase in browser console
import { recommendationService } from './services/recommendationService';
recommendationService.trackPurchase('tomatoes', 'user_123', 25);
```

## 🎯 Integration Testing Scenarios

### Cross-Feature Integration
1. **View → Recommend → Purchase Flow:**
   - Visit crop A → See recommendations for crop B → Visit crop B → Add to cart
   - Verify tracking influences future recommendations

2. **Alert → Navigate → Purchase:**
   - Set price alert → Receive notification → Click "View Crops" → Make purchase

3. **Seasonal → Detail → Recommend:**
   - Click seasonal recommendation → View crop detail → See related recommendations

## 📊 Performance Testing

### Loading Performance
- ✅ Recommendations load within 1 second
- ✅ Skeleton screens show immediately
- ✅ No blocking of main UI during AI processing
- ✅ Error handling gracefully degrades

### Data Persistence
- ✅ View history persists across sessions
- ✅ Price alerts survive browser refresh
- ✅ User preferences maintained

## 🐛 Error Testing

### Network Issues
1. Disable network in DevTools
2. Try loading recommendations

**Expected**: Graceful error message with retry option

### Invalid Data
1. Manually corrupt localStorage data
2. Navigate to crop detail page

**Expected**: System recovers and shows default state

## 🔍 Advanced Testing

### AI Algorithm Testing
Test different recommendation reasons by visiting crops in these categories:
- **Same Category**: Tomatoes → Other vegetables
- **Seasonal**: Summer crops → Other summer crops  
- **Frequently Bought**: Tomatoes → Lettuce/Spinach
- **User History**: Visit same category multiple times

### Confidence Score Validation
Check that confidence scores make logical sense:
- Same category items: ~85%
- Seasonal items: ~75%
- Frequently bought: ~90%
- Purchase history: ~95%

## 📱 Mobile Testing

### Responsive Design
1. Test on mobile viewport (375px width)
2. Verify all components remain usable
3. Check touch interactions work properly

**Key Elements:**
- ✅ Recommendation cards stack properly
- ✅ Price prediction fits mobile screen
- ✅ Notifications don't cover content
- ✅ Seasonal cards responsive layout

## 🚀 Performance Monitoring

### Key Metrics to Monitor
- Recommendation load time: < 1 second
- Price prediction accuracy: Visual consistency
- User engagement: Click-through rates on recommendations
- Alert effectiveness: Price drop notifications

---

## 🎉 Testing Success Criteria

✅ **All 5 major features functional**
✅ **Cross-feature integration working**  
✅ **Error handling robust**
✅ **Performance acceptable**
✅ **Mobile-responsive**
✅ **Data persistence working**

This comprehensive AI Recommendations system transforms the marketplace from a basic catalog into an intelligent, personalized shopping experience!
