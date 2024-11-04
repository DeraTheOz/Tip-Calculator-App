'use strict';

// Elements
const form = document.querySelectorAll('.form');
const tipContainer = document.querySelector('.tip__container');
const tips = document.querySelectorAll('.tip__percent');
const btn = document.querySelector('.btn');

// Input fields
const billInput = document.getElementById('bill');
const customTipInput = document.getElementById('custom-tip');
const numPeopleInput = document.getElementById('num-people');

// Error Elements
const billError = document.querySelector('.label-bill');
const numPeopleError = document.querySelector('.label-persons');

// Tip Results Display
const tipPerPerson = document.querySelector('.tip__per--person');
const tipTotal = document.querySelector('.tip__total');

///////////////////////////////////////////////////////////////
// Regex
const nonDigit = /\D/;
const hasLeadingZeros = /^0[0-9]+/;
const isValidDecimalNumber = /^(?!0$)(?!0\d)\d+(\.\d+)?$/;
const isValidWholeNumber = /^(?!0$)(?!0\d)\d+$/;

let tipSelected, customTipValue, numberOfPeople;

///////////////////////////////////////////////////////////////
// Helper Functions
///////////////////////////////////////////////////////////////
const disableBtn = () => {
	btn.disabled = true;
	btn.classList.add('disabled');
};

const enableBtn = () => {
	btn.disabled = false;
	btn.classList.remove('disabled');
};

// Show Error
const showError = (label, input, message) => {
	const labelError = label.firstElementChild;
	const inputFieldError = input;
	const errorMessage = message;

	labelError.textContent = message;
	inputFieldError.classList.add('input-error');
};

// Clear Error
const clearError = (label, input) => {
	const labelError = label.firstElementChild;
	const inputFieldError = input;

	labelError.textContent = '';
	inputFieldError.classList.remove('input-error');
};

// Reset Tip Results
const resetTips = () => {
	return (
		(tipPerPerson.textContent = '$0.00'), (tipTotal.textContent = '$0.00')
	);
};

// Update Tip Results
const updateTips = (tipAmount, totalTip) => {
	return (
		(tipPerPerson.textContent = `$${tipAmount.toFixed(2)}`),
		(tipTotal.textContent = `$${totalTip.toFixed(2)}`)
	);
};

// Clear All Data And Disable Btn
const clearAllTipsData = () => {
	disableBtn();

	tips.forEach(tip => tip.classList.remove('tip__selected'));

	tipSelected = null;

	customTipValue = null;
	customTipInput.value = '';

	billInput.value = '';
	numPeopleInput.value = '';

	resetTips();
};

// Get and Update the value of numberOfPeople
const updateNumberOfPeople = () => {
	const numPeople = numPeopleInput.value.trim();

	if (!numPeople || !isValidWholeNumber.test(numPeople)) {
		numberOfPeople = numPeople;
		return false;
	}

	numberOfPeople = parseFloat(numPeople);
	return true;
};

const resetDefaultTipSelected = tipValue => {
	customTipValue = tipValue;
	tipSelected = null;
	tips.forEach(tip => tip.classList.remove('tip__selected'));
	customTipInput.classList.add('custom-tip-error');
	resetTips();
};

const resetCustomTipSelected = tipValue => {
	tips.forEach(tip => tip.classList.remove('tip__selected'));
	customTipInput.classList.remove('custom-tip-error');
	customTipValue = parseFloat(tipValue);
	tipSelected = null;
	calculateTips();
};

///////////////////////////////////////////////////////////////
const handleTipSelection = function () {
	tipContainer.addEventListener('click', function (e) {
		const activeTip = e.target;

		if (activeTip.classList.contains('tip__percent')) {
			tips.forEach(tip => tip.classList.remove('tip__selected'));
			customTipInput.classList.remove('custom-tip-error');
			activeTip.classList.add('tip__selected');

			// Update tipSelected
			tipSelected = parseFloat(activeTip.getAttribute('data-tip'));

			// Reset customTipValue & customTipInput as default tip is selected
			customTipValue = null;
			customTipInput.value = '';
		}
	});
};

const validateCustomTipInput = function () {
	const customTip = customTipInput.value.trim();

	if (!customTip || !isValidDecimalNumber.test(customTip)) {
		resetDefaultTipSelected(customTip);
		return false;
	}

	resetCustomTipSelected(customTip);
	return true;
};

const validateBillInput = function () {
	const bill = billInput.value.trim();

	if (!isValidDecimalNumber.test(bill)) {
		showError(billError, billInput, 'Invalid bill amount');
		resetTips();
		return false;
	}

	clearError(billError, billInput);
	return true;
};

const validateNumPeopleInput = function () {
	const numPeople = numPeopleInput.value.trim();

	if (!numPeople) {
		showError(numPeopleError, numPeopleInput, 'Cannot be empty');
		resetTips();
		return false;
	}

	if (numPeople <= 0) {
		showError(numPeopleError, numPeopleInput, 'Must be > 0');
		resetTips();
		return false;
	}

	if (Math.sign(numPeople) !== 1 || nonDigit.test(numPeople)) {
		showError(numPeopleError, numPeopleInput, 'Invalid number');
		resetTips();
		return false;
	}

	if (hasLeadingZeros.test(numPeople)) {
		showError(numPeopleError, numPeopleInput, 'Invalid Format');
		resetTips();
		return false;
	}

	clearError(numPeopleError, numPeopleInput);
	return true;
};

const calculateTips = function () {
	const bill = billInput.value.trim();

	// Gaurd clause
	if (!updateNumberOfPeople()) return;

	// Use updated values for tip calculation
	const tipPercent = tipSelected || customTipValue;
	const tipAmount = ((bill / numberOfPeople) * tipPercent) / 100;
	const totalTip = bill / numberOfPeople + tipAmount;

	if (
		!validateBillInput() ||
		!tipPercent ||
		!Number.isFinite(tipPercent) ||
		!Number.isFinite(tipAmount) ||
		!Number.isFinite(totalTip)
	) {
		resetTips();
		return false;
	}

	updateTips(tipAmount, totalTip);
	return true;
};

const validateTips = () => {
	if (!calculateTips()) {
		disableBtn();
	} else {
		enableBtn();
	}
};

const init = () => {
	disableBtn();
	handleTipSelection();
	updateNumberOfPeople();

	billInput.addEventListener('input', validateBillInput);
	billInput.addEventListener('input', calculateTips);
	customTipInput.addEventListener('input', validateCustomTipInput);
	numPeopleInput.addEventListener('input', calculateTips);
	numPeopleInput.addEventListener('input', validateNumPeopleInput);

	[numPeopleInput, billInput, customTipInput].forEach(input => {
		input.addEventListener('input', validateTips);
	});

	tipContainer.addEventListener('click', validateTips);
	btn.addEventListener('click', clearAllTipsData);

	form.forEach(form => {
		form.addEventListener('submit', e => {
			e.preventDefault();
		});
	});
};
init();
