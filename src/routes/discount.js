const express = require('express');
const router = express.Router();
const zipPurchasingPower = require('../data/zipPurchasingPower.json');
const deviceValueData = require('../data/deviceValue.json');

// Calculate discount based on various parameters
router.post('/', (req, res, next) => {
    try {
        const { ageRange, zipCode, deviceType, deviceAge } = req.body;

        // Validate input fields
        if (!ageRange) {
            res.status(400);
            throw new Error('Age range is required');
        }
        if (!zipCode) {
            res.status(400);
            throw new Error('ZIP Code is required');
        }
        if (!deviceType) {
            res.status(400);
            throw new Error('Device type is required');
        }
        if (!deviceAge) {
            res.status(400);
            throw new Error('Device age is required');
        }

        // Parse device age if it's a string
        const parsedDeviceAge = parseFloat(deviceAge);
        if (isNaN(parsedDeviceAge) || parsedDeviceAge < 0) {
            res.status(400);
            throw new Error('Device age must be a valid positive number');
        }

        // Validate age range
        let ageFactor = getAgeFactor(ageRange);

        // Validate ZIP code
        let zipPower = zipPurchasingPower[zipCode];
        if (!zipPower) {
            res.status(404);
            throw new Error(`ZIP Code '${zipCode}' not found`);
        }

        // Validate device type and age
        let deviceFactor = getDeviceFactor(deviceType, parsedDeviceAge);

        // Device type adjustment
        const deviceTypeFactor = deviceType.toLowerCase() === 'mobile' ? 0.9 : 1.0;

        // Purchasing power score
        const purchasingPower = zipPower * ageFactor * deviceFactor * deviceTypeFactor;

        // Calculate discount between 5% (highest power) and 30% (lowest power)
        let discount = calculateDiscount(purchasingPower);

        // Send successful response
        res.json({
            discount: `${discount.toFixed(2)}`,
            purchasingPower: purchasingPower.toFixed(2),
            ageRange,
            zipCode,
            deviceType,
            deviceAge: parsedDeviceAge
        });
    } catch (error) {
        next(error); // Pass errors to the error handler middleware
    }
});

// Helper to get age factor
function getAgeFactor(ageRange) {
    switch (ageRange) {
        case '18-25': return 0.7;
        case '26-35': return 0.85;
        case '36-45': return 1.0;
        case '46+': return 0.9;
        default: throw new Error('Invalid age range. Valid ranges are: 18-25, 26-35, 36-45, 46+');
    }
}

// Helper to get device factor based on device age and retail price
function getDeviceFactor(deviceType, deviceAge) {
    const device = deviceValueData[deviceType.toLowerCase()];
    if (!device) throw new Error('Device type not found');

    const { retailPrice, ageValueMultiplier } = device;

    // Get multiplier based on device age
    const ageRangeKey = Object.keys(ageValueMultiplier).find(range => {
        const [min, max] = range.split('-').map(Number);
        return deviceAge >= min && deviceAge <= max;
    });

    if (!ageRangeKey) throw new Error('Invalid device age');

    const valueMultiplier = ageValueMultiplier[ageRangeKey];
    return retailPrice * valueMultiplier;
}

// Helper to calculate discount
function calculateDiscount(purchasingPower) {
    const minPurchasingPower = 30000;
    const maxPurchasingPower = 150000;

    let discount = 30 - ((purchasingPower - minPurchasingPower) / (maxPurchasingPower - minPurchasingPower)) * 25;

    return Math.max(5, Math.min(discount, 30));
}

module.exports = router;
