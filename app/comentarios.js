// Importa el servicio para manejar la lógica de datos de los contactos.
import contactsService from "./contacts.js";

// --- SELECTORES DEL DOM ---

// Selectores del formulario principal y sus elementos.
const form = document.querySelector('#main-form');
const inputName = document.querySelector('#name-input');
const inputPhone = document.querySelector('#phone-input');
const formButton = document.querySelector('#main-form-btn');

// Selectores para la lista de contactos y la plantilla de un ítem.
const contactsList = document.querySelector('#contacts-list');
const contactItemTemplate = document.querySelector('#template-contact-item');

// --- CONSTANTES Y ESTADO ---

// Expresiones regulares para validar el formato del nombre y el teléfono.
const NAME_REGEX = /^[A-Z][a-z]*[ ][A-Z][a-z]{3,}[ ]{0,1}$/;
const PHONE_REGEX = /^[0](414|424|416|426|422|412|212)[0-9]{7}$/;

// Variables de estado para la validez de los campos del formulario.
let isValidName = false;
let isValidPhone = false;

// --- FUNCIONES DE RENDERIZADO (LÓGICA DE INTERFAZ) ---

/**
 * Gestiona las clases visuales de un campo de formulario (válido/inválido/por defecto) 
 * y la visibilidad del texto de ayuda.
 * @param {HTMLInputElement} input - El elemento input.
 * @param {boolean} isValid - Indica si el valor del input es válido.
 */
const handleStateInput = (input, isValid) =>{
  const helperText = input.nextElementSibling;  
  if (!input.value) {
    // Estado por defecto (vacío).
    input.classList.remove('input-invalid');
    input.classList.remove('input-valid');
    helperText.classList.remove('show-helper-text');
  } else if (isValid) {
    // Estado de input válido.
    input.classList.add('input-valid');
    input.classList.remove('input-invalid');
    helperText.classList.remove('show-helper-text');
  } else {
    // Estado de input inválido.
    input.classList.add('input-invalid');
    input.classList.remove('input-valid');
    helperText.classList.add('show-helper-text');
  }
}

/**
 * Habilita o deshabilita el botón de enviar del formulario principal 
 * en función de la validez de los campos de nombre y teléfono.
 */
const handleFormBtnState = () => {
  if (isValidName && isValidPhone) {
    formButton.disabled = false;
  } else {
    formButton.disabled = true;
  }
}

/**
 * Renderiza la lista completa de contactos en el DOM, vaciando la lista actual y 
 * creando nuevos elementos a partir de la plantilla.
 * @param {Array<object>} contacts - El array de contactos a renderizar.
 */
const renderContacts = (contacts) => {
  contactsList.innerHTML = '';
  contacts.forEach(contact => {
    // Clona la plantilla para crear el ítem del contacto.
    const li = contactItemTemplate.content.cloneNode(true).children[0];
    li.id = contact.id;

    // Asigna los valores del contacto a los inputs del ítem.
    const liNameInput = li.children[0].children[0];
    const liPhoneInput = li.children[0].children[1];
    
    liNameInput.setAttribute('value', contact.name);
    liPhoneInput.setAttribute('value', contact.phone);
    contactsList.append(li);
  });
}

// --- MANEJADORES DE EVENTOS ---

// Maneja la entrada de datos en el campo de nombre.
inputName.addEventListener('input', e => {
  // LÓGICA DE NEGOCIO (Validación)
  isValidName = NAME_REGEX.test(inputName.value);
  
  // LÓGICA DE RENDERIZADO (Actualización de la UI)
  handleStateInput(inputName, isValidName);
  handleFormBtnState();
});

// Maneja la entrada de datos en el campo de teléfono.
inputPhone.addEventListener('input', e => {
  // LÓGICA DE NEGOCIO (Validación)
  isValidPhone = PHONE_REGEX.test(inputPhone.value);
  
  // LÓGICA DE RENDERIZADO (Actualización de la UI)
  handleStateInput(inputPhone, isValidPhone);
 handleFormBtnState();
});

// Maneja el envío del formulario para añadir un nuevo contacto.
form.addEventListener('submit', e => {
  e.preventDefault();
  
  // LÓGICA DE NEGOCIO (Guardado del contacto y persistencia)
  if (!isValidName || !isValidPhone) return;

  // Añade el contacto usando el servicio.
  contactsService.addContact({
    name: inputName.value,
    phone: inputPhone.value
  });
  // Guarda los contactos en el almacenamiento local.
  contactsService.saveContactsInBrowser();

  // LÓGICA DE RENDERIZADO (Actualización de la lista de contactos)
  const contacts = contactsService.getContacts();
  renderContacts(contacts);
});

// Maneja los eventos de clic dentro de la lista de contactos (Delegación de eventos).
contactsList.addEventListener('click', e => {
  const deleteBtn = e.target.closest('.delete-btn');
  const editBtn = e.target.closest('.edit-btn');

  // LÓGICA PARA ELIMINAR UN CONTACTO
  if (deleteBtn) {
    const li = deleteBtn.parentElement.parentElement;
    
    // LÓGICA DE NEGOCIO
    contactsService.deleteContact(li.id);
    contactsService.saveContactsInBrowser();

    // LÓGICA DE RENDERIZADO
    li.remove();
  }

  // LÓGICA PARA EDITAR O GUARDAR UN CONTACTO
  if (editBtn) {
    // Obtiene los elementos necesarios del DOM.
    const li = editBtn.parentElement.parentElement;
    const id = li.id;
    const liNameInput = li.children[0].children[0];
    const liPhoneInput = li.children[0].children[1];
    const isEditing = li.dataset.editing === 'true';
    const liEditIcon = li.children[1].children[0].children[0];
    
    if (isEditing) {
      // --- LÓGICA DE NEGOCIO (Guardar edición) ---
      console.log('Guardando el contacto');

      // Actualiza el contacto con los nuevos valores.
      contactsService.updateContact(id, {name: liNameInput.value, phone: liPhoneInput.value});
      // Persiste los cambios en el almacenamiento local.
      contactsService.saveContactsInBrowser();
      
      // --- LÓGICA DE RENDERIZADO (Cambiar a modo "no edición") ---
      li.dataset.editing = false;
      // Elimina estilos de edición y restablece el atributo readonly.
      liNameInput.classList.remove('input-is-editing');
      liPhoneInput.classList.remove('input-is-editing');
      liNameInput.setAttribute('readonly', '');
      liPhoneInput.setAttribute('readonly', '');
      // Restablece el ícono a su estado por defecto.
      liEditIcon.name = liEditIcon.dataset.defaultIcon;

    } else {
      // --- LÓGICA DE NEGOCIO (Preparar para editar) ---
      console.log('Empenzando a editar el contacto');
      // Simplemente cambia el estado interno, no hay interacción con el servicio.
      
      // --- LÓGICA DE RENDERIZADO (Cambiar a modo "edición") ---
      li.dataset.editing = true;
      // Añade estilos de edición y quita el atributo readonly.
      liNameInput.classList.add('input-is-editing');
      liPhoneInput.classList.add('input-is-editing');
      liNameInput.removeAttribute('readonly');
      liPhoneInput.removeAttribute('readonly');
      // Cambia el ícono para indicar el modo "guardar".
      liEditIcon.name = 'pencil-outline';
    }
    
  }
});

// --- INICIALIZACIÓN ---

// Función que se ejecuta al cargar la ventana para inicializar la aplicación.
window.onload = () => {
  // LÓGICA DE NEGOCIO (Carga inicial de datos)
  // Carga los contactos almacenados en el navegador.
  contactsService.getContactsFromBrowser();
  
  // LÓGICA DE RENDERIZADO (Muestra los datos cargados)
  // Obtiene los contactos y los renderiza en la interfaz.
  const contacts = contactsService.getContacts();
  renderContacts(contacts);
}