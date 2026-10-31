'use strict';

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  navigation.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
  if (open) navigation.querySelector('a').focus();
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', event => {
  if (menuButton.getAttribute('aria-expanded') !== 'true') return;
  if (event.key === 'Escape') { setMenu(false); menuButton.focus(); }
  if (event.key === 'Tab') {
    const focusable = [...navigation.querySelectorAll('a'), menuButton];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
const desktopQuery = window.matchMedia('(min-width: 801px)');
desktopQuery.addEventListener('change', event => { if (event.matches) setMenu(false); });

const form = document.querySelector('#signup-form');
const nameField = document.querySelector('#parent-name');
const phoneField = document.querySelector('#phone');
const ageField = document.querySelector('#child-age');
const groupField = document.querySelector('#group');
const result = document.querySelector('#form-result');
const fields = [nameField, phoneField, ageField, groupField];
let submitted = false;

function getError(field) {
  const value = field.value.trim();
  if (field === nameField) {
    if (!value) return 'Укажите имя родителя.';
    if ((value.match(/\p{L}/gu) || []).length < 2) return 'Введите имя: минимум две буквы.';
  }
  if (field === phoneField) {
    if (!value) return 'Укажите номер телефона.';
    const digits = value.replace(/\D/g, '');
    if (!/^\+?[\d\s()\-]+$/.test(value) || digits.length < 10 || digits.length > 15) return 'Введите телефон: от 10 до 15 цифр.';
  }
  if (field === ageField) {
    if (!value) return 'Укажите возраст ребёнка.';
    const age = Number(value);
    if (!Number.isInteger(age) || age < 6 || age > 16) return 'Укажите целый возраст от 6 до 16 лет.';
  }
  if (field === groupField) {
    if (!['kids', 'junior'].includes(value)) return 'Выберите группу.';
    const age = Number(ageField.value);
    if (Number.isInteger(age) && age >= 6 && age <= 16) {
      if (value === 'kids' && age > 9) return 'Для возраста 10–16 лет выберите PRO JUNIOR.';
      if (value === 'junior' && age < 10) return 'Для возраста 6–9 лет выберите PRO KIDS.';
    }
  }
  return '';
}
function validate(field) {
  const error = getError(field);
  document.getElementById(`${field.id}-error`).textContent = error;
  field.setAttribute('aria-invalid', String(Boolean(error)));
  return !error;
}
function hideResult() { result.hidden = true; result.textContent = ''; }

document.querySelectorAll('[data-group]').forEach(link => {
  link.addEventListener('click', () => {
    groupField.value = link.dataset.group;
    if (submitted) validate(groupField);
    hideResult();
  });
});
ageField.addEventListener('input', () => {
  const age = Number(ageField.value);
  if (Number.isInteger(age) && age >= 6 && age <= 16) groupField.value = age <= 9 ? 'kids' : 'junior';
  if (submitted) validate(groupField);
});
fields.forEach(field => {
  field.addEventListener('blur', () => { if (field.value.trim() || submitted) validate(field); });
  field.addEventListener('input', () => {
    hideResult();
    if (submitted || field.getAttribute('aria-invalid') === 'true') validate(field);
  });
  field.addEventListener('change', () => { hideResult(); if (submitted) validate(field); });
});
form.addEventListener('submit', event => {
  event.preventDefault();
  submitted = true;
  const valid = fields.map(validate).every(Boolean);
  result.hidden = false;
  result.classList.toggle('is-error', !valid);
  if (!valid) {
    result.textContent = 'Проверьте отмеченные поля. Это демонстрационная форма: заявка не отправлена.';
    fields.find(field => field.getAttribute('aria-invalid') === 'true').focus();
    return;
  }
  result.textContent = 'Поля заполнены корректно. Это демонстрационная форма — заявка ещё не отправлена. Данные никуда не переданы. Для реальной записи позвоните: 8(977)294-51-60.';
  result.focus({preventScroll: true});
  result.scrollIntoView({block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
});
// Активируем кнопку только после подключения обработчика, исключая обычную отправку формы.
form.querySelector('button[type="submit"]').disabled = false;

if ('IntersectionObserver' in window) {
  const navLinks = [...navigation.querySelectorAll('a')];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, {rootMargin: '-20% 0px -60% 0px', threshold: 0});
  document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
}
