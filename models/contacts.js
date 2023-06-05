const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const contactsPath = path.join("./models", "contacts.json");
const contactsData = require("./contacts.json");

const listContacts = async () => {
  try {
    const data = await fs.readFile(contactsPath);
    return JSON.parse(data.toString());
  } catch (err) {
    console.log(err.message);
  }
};

const getContactById = async (contactId) => {
  try {
    const data = await fs.readFile(contactsPath);
    const dataParsed = JSON.parse(data.toString());
    const dataId = dataParsed.filter((el) => el.id === contactId);

    if (dataId.length > 0) {
      return dataId;
    }
    // return { info: "contact you are looking for doesn't exist" };
  } catch (err) {
    console.log(err.message);
  }
};

const removeContact = async (contactId) => {
  try {
    const data = await fs.readFile(contactsPath);
    const dataParsed = JSON.parse(data.toString());
    const contactIndex = dataParsed.findIndex(
      (contact) => contact.id === contactId
    );
    if (contactIndex !== -1) {
      contactsData.splice(contactIndex, 1);

      await fs.writeFile(contactsPath, JSON.stringify(contactsData), (err) => {
        if (err) {
          console.log(err.message);
        }
      });
      console.log("Contact removed. File saved with updated contacts list");
      return true;
    } else {
      console.log(
        "Sorry. Contact you are trying to delete, doesn't exist in database"
      );
    }
  } catch (err) {
    console.log(err.message);
  }
};

const addContact = async (contact) => {
  const { name, email, phone } = contact;

  const newContact = {
    id: crypto.randomUUID(),
    name,
    email,
    phone,
  };

  contactsData.push(newContact);

  const contactsDataUpd = JSON.stringify(contactsData);

  fs.writeFile(contactsPath, contactsDataUpd, (err) => {
    if (err) {
      console.log("Data can't be written in file:", err.message);
    }
  });
  console.log("Contact added to database");
  return newContact;
};

const updateContact = async (contactId, req) => {
  const { name, email, phone } = req;

  const data = await fs.readFile(contactsPath);
  const dataParsed = JSON.parse(data.toString());
  const contactIndex = dataParsed.findIndex(
    (contact) => contact.id === contactId
  );
  if (contactIndex !== -1) {
    name !== undefined && (dataParsed[contactIndex].name = name);
    email !== undefined && (dataParsed[contactIndex].email = email);
    phone !== undefined && (dataParsed[contactIndex].phone = phone);

    await fs.writeFile(contactsPath, JSON.stringify(dataParsed), (err) => {
      if (err) {
        console.log(err.message);
      }
    });
    console.log("Contact data changed");
    return dataParsed[contactIndex];
  } else {
    console.log("Sorry.There is no contact you want to update.");
    return false
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
