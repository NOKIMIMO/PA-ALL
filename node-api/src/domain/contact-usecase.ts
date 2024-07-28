import { DataSource } from "typeorm";
import { Contact } from "../database/models/contact";
import { CreateContactRequest } from "../Validators/contactValidator";

export class ContactUseCase {
    constructor(private readonly db: DataSource) {}

    async createContact(data: CreateContactRequest): Promise<Contact> {
        const contactRepository = this.db.getRepository(Contact);
        const newContact = contactRepository.create(data);
        return await contactRepository.save(newContact);
    }

    async listContacts(): Promise<Contact[]> {
        const contactRepository = this.db.getRepository(Contact);
        return await contactRepository.find();
    }
}
