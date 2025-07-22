import { connectToDatabase } from "@/lib/mongodb/mongoose";
import User from "@/lib/models/User";

export async function createOrUpdateUser({
  id,
  email_addresses,
  first_name,
  last_name,
  image_url,
}) {
  try {
    await connectToDatabase();

    const user = await User.findOneAndUpdate(
      { clerkId: id },
      {
        $set: {
          email: email_addresses[0].email_address,
          firstName: first_name,
          lastName: last_name,
          profileImage: image_url,
        },
      },
      { new: true, upsert: true }
    );
    return user;
  } catch (error) {
    console.error("Error creating or updating user:", error);
    throw new Error("Failed to create or update user");
  }
}

export async function deleteUser(id) {
  try {
    await connectToDatabase();

    await User.findOneAndDelete({ clerkId: id });
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
}
