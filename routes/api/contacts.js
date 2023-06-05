const express = require("express");
const router = express.Router();
const Joi = require("joi");
const contacts = require("../../models/contacts");

const postSchema = Joi.object({
  name: Joi.string()
    .pattern(/^[a-zA-Zа]+(([' -]?[a-zA-Zа ])?[a-zA-Zа]*)*$/)
    .required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{2,3}[-s.]?[0-9]{4,6}$/)
    .required(),
});

const putSchema = Joi.object({
  name: Joi.string().pattern(/^[a-zA-Zа]+(([' -]?[a-zA-Zа ])?[a-zA-Zа]*)*$/),
  email: Joi.string().email(),
  phone: Joi.string().pattern(
    /^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{2,3}[-s.]?[0-9]{4,6}$/
  ),
});

router.get("/", async (_, res, next) => {
  const contactsList = await contacts.listContacts();
  res.json(contactsList);
  next();
});

router.get("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await contacts.getContactById(contactId);
  if (contact) {
    res.json(contact);
    return;
  }
  res.status(404).json({ message: "Not found" });
  next();
});

router.post("/", async (req, res, next) => {
  const { name, email, phone } = req.query;

  if (name === undefined || email === undefined || phone === undefined) {
    res.status(400).json({ message: "missing required name - field" });
    return;
  }

  const validationResult = postSchema.validate({ name, email, phone });

  if (validationResult.error) {
    console.log(validationResult.error.details);
    res.status(400).json({ message: "data are invalid!" });
    return;
  }

  const newContact = await contacts.addContact(req.query);

  res.status(201).json(newContact);
  next();
});

router.delete("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;

  const isContactDeleted = await contacts.removeContact(contactId);
  if (isContactDeleted) {
    res.json({ message: "contact deleted" });
  } else {
    res.status(404).json({ message: "Not found" });
  }
  next();
});

router.put("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  const { name, email, phone } = req.query;

  if (contacts.updateContact(contactId, req.query)) {
    res.status(404).json({ message: "Not found" });
    return;
  }

  if (name === undefined && email === undefined && phone === undefined) {
    res.status(400).json({ message: "missing fields" });
    return;
  }

  const validationResult = putSchema.validate({ name, email, phone });

  if (validationResult.error) {
    console.log(validationResult.error.details);
    res.status(400).json({ message: "data are invalid!" });
    return;
  }

  const updatedContact = await contacts.updateContact(contactId, req.query);

  console.log(updatedContact);

  res.json(updatedContact);
});

module.exports = router;
