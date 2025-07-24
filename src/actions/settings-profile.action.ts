import { ActionResponse } from "@/types/action-response";
import { createClient } from "@/utils/supabase/server";
import { validatorUploadProfile } from "@/validators/profile.validator";

type UpdateProfileParams = {
    fullName: string;
    bio: string;
}

export default async function updateProfile(data: UpdateProfileParams): Promise<ActionResponse<null>> {
    const validate = validatorUploadProfile.safeParse(data)
    if (!validate.success) return {
        success: false,
        error: validate.error.errors[0].message,
        data: null
    }
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return {
        success: false,
        error: "User not founded",
        data: null
    }

    const { error } = await supabase.auth.updateUser({
        data: {
            full_name: data.fullName,
            bio: data.bio
        }
    })
    if (error) return {
        success: false,
        error: error.message,
        data: null
    }

    return {
        success: true,
        error: null,
        data: null
    }
}