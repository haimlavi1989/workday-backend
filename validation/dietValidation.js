const { check } = require('express-validator');

// Validation rules for creating a diet
exports.createDietValidationRules = () => [
    check('startTime').isISO8601().toDate(),
    check('endTime').isISO8601().toDate(),
    check('weight').isNumeric(),
];

// Validation rules for get a diet
exports.getDietValidationRules = () => [
    check('id').isMongoId()
];

// Validation rules for updating a diet
exports.updateDietValidationRules = () => [
    check('startTime').optional().isISO8601().toDate(),
    check('endTime').optional().isISO8601().toDate(),
    check('foodList').optional().isArray(),
    check('reminderId').isMongoId(),
];

// Validation rules for delete a diet
exports.deleteDietValidationRules = () => [
    check('id').isMongoId()
];