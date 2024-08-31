import { DataSource, In } from "typeorm";
import { CustomError } from "../common/error/customError";
import { License } from "../database/models/license";
import { User } from "../database/models/user";
import { ListItemRequest } from "../Validators/commonValidator";
import { UserResponse } from "../Validators/userValidator";
import Stripe from "stripe";
import { user_access_type } from "../common/enum/access-type";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export class LicenseUseCase {
    constructor(private readonly db: DataSource) { }

    async createLicense(stripe_id:string,current_user:number): Promise<void> {
        const userRepo = this.db.getRepository(User)
        const user = await userRepo.findOneBy({ id: current_user })
        if (!user) {
            throw new CustomError(404, 'User not found')
        }
        const licenseRepo = this.db.getRepository(License)
        const licenseFound = await licenseRepo.find({where: {userId: user.id, active: true}});
        if (licenseFound.length > 0) {
            throw new CustomError(400, 'User already has an active license');
        }
        const session = await stripe.checkout.sessions.retrieve(stripe_id);
        if (session.payment_status !== 'paid') {
            throw new CustomError(400, 'Payment not completed');
        }
        //6months
        const expirationDate =  new Date();
        expirationDate.setMonth(expirationDate.getMonth() + 6);
        const license =  licenseRepo.create([{
            user: { id: user.id },
            userId: user.id,
            price: session.amount_total!,
            active: true,
            expirationDate: expirationDate
        }])
        await licenseRepo.save(license);
        user.role = user_access_type.LICENSED;
        await userRepo.save(user);

    }
}