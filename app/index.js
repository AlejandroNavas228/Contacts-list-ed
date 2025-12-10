import contactsService from "./contacts.js";

// Selectores
const form = document.querySelector('#main-form');
const inputName = document.querySelector('#name-input');
const inputPhone = document.querySelector('#phone-input');
const formButton = document.querySelector('#main-form-btn');

const contactsList = document.querySelector('#contacts-list');
const contactItemTemplate = document.querySelector('#template-contact-item');


const NAME_REGEX = /^[A-Z][a-z]*[ ][A-Z][a-z]{2,}[ ]{0,1}$/;
const PHONE_REGEX = /^[0](414|424|416|426|422|412|212)[0-9]{7}$/;

let isValidName = false;
let isValidPhone = false;

const handleStateInput = (input, isValid) => {
  const helperText = input.nextElementSibling; 
  
  if (!input.value) {
    input.classList.remove('input-invalid');
    input.classList.remove('input-valid');
    if (helperText && helperText.classList.contains('main-form-helper-text')) {
        helperText.classList.remove('show-helper-text');
    }
  } else if (isValid) {
    input.classList.add('input-valid');
    input.classList.remove('input-invalid');
    if (helperText && helperText.classList.contains('main-form-helper-text')) {
        helperText.classList.remove('show-helper-text');
    }
  } else {
    input.classList.add('input-invalid');
    input.classList.remove('input-valid');
    if (helperText && helperText.classList.contains('main-form-helper-text')) {
        helperText.classList.add('show-helper-text');
    }
  }
}

const handleFormBtnState = () => {
  if (isValidName && isValidPhone) {
    formButton.disabled = false;
  } else {
    formButton.disabled = true;
  }
}

const renderContacts = (contacts) => {
  contactsList.innerHTML = '';
  contacts.forEach(contact => {
    const li = contactItemTemplate.content.cloneNode(true).children[0];
    li.id = contact.id;

    const liNameInput = li.children[0].children[0];
    const liPhoneInput = li.children[0].children[2];
    
    liNameInput.setAttribute('value', contact.name);
    liPhoneInput.setAttribute('value', contact.phone);
    contactsList.append(li);
  });
}

inputName.addEventListener('input', e => {
  isValidName = NAME_REGEX.test(inputName.value);
  handleStateInput(inputName, isValidName);
  handleFormBtnState();
});

inputPhone.addEventListener('input', e => {
  isValidPhone = PHONE_REGEX.test(inputPhone.value);
  handleStateInput(inputPhone, isValidPhone);
  handleFormBtnState();
});

form.addEventListener('submit', e => {
  e.preventDefault();
  if (!isValidName || !isValidPhone) return;
  contactsService.addContact({
    name: inputName.value,
    phone: inputPhone.value
  });
  contactsService.saveContactsInBrowser();
  const contacts = contactsService.getContacts();
  renderContacts(contacts);
});

contactsList.addEventListener('click', e => {
  const deleteBtn = e.target.closest('.delete-btn');
  const editBtn = e.target.closest('.edit-btn');

  if (deleteBtn) {
    const li = deleteBtn.parentElement.parentElement;
    contactsService.deleteContact(li.id);
    contactsService.saveContactsInBrowser();
    li.remove();
  }

  if (editBtn) {
    const li = editBtn.parentElement.parentElement;
    const id = li.id;
    const liNameInput = li.children[0].children[0];
    const liPhoneInput = li.children[0].children[2];
    const isEditing = li.dataset.editing === 'true';
    const liEditIcon = li.children[1].children[0].children[0];
    
    if (isEditing) {
     
      const newNameValue = liNameInput.value;
      const newPhoneValue = liPhoneInput.value;
      
      const isNameValid = NAME_REGEX.test(newNameValue);
      const isPhoneValid = PHONE_REGEX.test(newPhoneValue);

      handleStateInput(liNameInput, isNameValid);
      handleStateInput(liPhoneInput, isPhoneValid);

      if (!isNameValid || !isPhoneValid) {
        alert("Error: El nombre o el teléfono no cumplen con el formato requerido. Por favor, corrígelos antes de guardar.");
        return;
      }

      li.dataset.editing = false;
      
      liNameInput.classList.remove('input-is-editing', 'input-valid', 'input-invalid');
      liPhoneInput.classList.remove('input-is-editing', 'input-valid', 'input-invalid');
      
      liNameInput.oninput = null;
      liPhoneInput.oninput = null;

      liNameInput.setAttribute('readonly', '');
      liPhoneInput.setAttribute('readonly', '');
      
      contactsService.updateContact(id, {name: liNameInput.value, phone: liPhoneInput.value});
      contactsService.saveContactsInBrowser();
      liEditIcon.name = liEditIcon.dataset.defaultIcon;

    } else {
      li.dataset.editing = true;
      
      liNameInput.classList.add('input-is-editing');
      liPhoneInput.classList.add('input-is-editing');
      
      liNameInput.removeAttribute('readonly');
      liPhoneInput.removeAttribute('readonly');
      

      handleStateInput(liNameInput, NAME_REGEX.test(liNameInput.value));
      handleStateInput(liPhoneInput, PHONE_REGEX.test(liPhoneInput.value));

      
      liNameInput.oninput = () => {
        handleStateInput(liNameInput, NAME_REGEX.test(liNameInput.value));
      };
      
      liPhoneInput.oninput = () => {
        handleStateInput(liPhoneInput, PHONE_REGEX.test(liPhoneInput.value));
      };

      liEditIcon.name = 'checkmark-outline'; 
    }
  }
});

window.onload = () => {
  contactsService.getContactsFromBrowser();
  const contacts = contactsService.getContacts();
  renderContacts(contacts);
}