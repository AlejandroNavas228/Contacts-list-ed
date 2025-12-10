/**
 * @typedef {object} Contact
 * @property {string} id - El id del contacto, que es aleatorio.
 * @property {string} name - El nombre y apellido del contactpo.
 * @property {string} phone - El numero telefonico venezolano del contacto.
*/

/** @type {Contact[]} */
let contacts = [];

/**
 * Crea un nuevo contacto
 * @param {object} payload 
 * @param {string} payload.name - El nombre del contacto.
 * @param {string} payload.phone - El numero del contacto
 */
const addContact = (payload) => {
    const id = crypto.randomUUID();
    const newContact = { id, ...payload };
    contacts = contacts.concat(newContact);
}

/**
 * Obtiene los contactos
 */
const getContacts = () => {
    return contacts;
}

/**
 * Elimina un contacto
 * @param {string} id - El id del contacto a eliminar.
 */
const deleteContact = (id) => {
    contacts = contacts.filter(contact => contact.id !== id);
}

/**
 * Guarda los contactos en el navegador.
 */
const saveContactsInBrowser = () => {
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

/**
 * Obtiene los contactos del navegador
 */
const getContactsFromBrowser = () => {
    const contactsInJson = localStorage.getItem('contacts');
    contacts = JSON.parse(contactsInJson) ?? [];
}

/**
 * Edita un contacto
 * @param {string} id - El id del contacto a actualizar.
 * @param {object} payload 
 * @param {string} payload.name - El nombre del contacto.
 * @param {string} payload.phone - El numero del contacto
 */
const updateContact = (id, payload) => {
    contacts = contacts.map(contact => {
        if (contact.id === id) {
            return {
                ...contact, 
                name: payload.name, 
                phone: payload.phone
            }
        } else {
            return contact
        }
    });

    // Otra manera de hacerlo
    // const contactToUpdate = contacts.find(contact => contact.id === id);
    // if (!contactToUpdate) return;
    // const contactUpdated = {...contactToUpdate, name: payload.name, phone: payload.phone};
    // contacts = contacts.map(contact => contact.id === id ? contactUpdated : contact);
}




const contactsService = {
    addContact,
    getContacts,
    deleteContact,
    saveContactsInBrowser,
    getContactsFromBrowser,
    updateContact
}

export default contactsService;