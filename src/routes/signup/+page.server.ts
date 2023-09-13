import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from "@sveltejs/kit";
import { z } from 'zod';
import { superValidate, setError } from "sveltekit-superforms/server"
import Surreal from "surrealdb.js";
import { ONE_DAY } from "$lib/constants";
import { parsePhoneNumber } from 'awesome-phonenumber'
import { getName } from 'country-list'

const schema = z.object({
  name: z.string().min(1),
  country: z.string().min(2).refine(getName),
  phone: z.string().min(2).refine(phone => parsePhoneNumber(phone).valid),
  email: z.string().email(),
  password: z.string().min(5),
  passwordConfirmation: z.string(),
})

export const load = (async () => {
  const form = await superValidate(schema);
  return { form }
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request, platform, cookies }) => {
    const form = await superValidate(request, schema);

    if (!form.valid) {
      return fail(400, { form })
    }

    if (!platform?.env?.PUBLIC_SURREAL_URL) {
      return fail(500, { form, error: "missing env vars" });
    }

    const { PUBLIC_SURREAL_URL, PUBLIC_SURREAL_DATABASE, PUBLIC_SURREAL_NAMESPACE } = platform?.env;

    const db = new Surreal(`${PUBLIC_SURREAL_URL}/rpc`);

    try {
			let jwt = await db.signup({
				NS: PUBLIC_SURREAL_NAMESPACE,
				DB: PUBLIC_SURREAL_DATABASE,
				SC: "end_user",
				name: form.data.name,
				country: form.data.country,
        phone: form.data.phone,
				email: form.data.email,
				password: form.data.password,
			});
      // TODO set secure to true the future
      cookies.set('jwt', jwt, { httpOnly: true, sameSite: 'strict', maxAge: ONE_DAY });
      let userResults = await db.query('SELECT * FROM user WHERE email = $email', { email: form.data.email })
      const user: User = userResults[0]?.result?.[0];
      cookies.set('user_id', user.id, { httpOnly: true, sameSite: 'strict', maxAge: ONE_DAY})
    } catch (e) {
      console.log(e);
      // assume all authentication errors are a failed email or phone unique constraint validation
      setError(form, 'email', "email is potentially already taken");
      setError(form, 'phone', "phone is potentially already taken");
      return fail(400, { form });
    }
    throw redirect(302, `/${form.data.email}/dashboard`);
  }
} satisfies Actions;