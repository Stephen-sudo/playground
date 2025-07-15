import { dbconnect } from "@/lib/mongodb";
import User from "@/lib/models/User";

export const createOrUpdateUser = async (
  id,
  first_name,
  last_name,
  image_url,
  email_addresses
) => {
  try {
    await dbconnect();

    // Check if user already exists
    const user = await User.findOneAndUpdate(
      { clerkId: id },
      {
        $set: {
          clerkId: id,
          firstName: first_name,
          lastName: last_name,
          profileImageUrl: image_url,
          email: email_addresses[0].email_address,
        },
      },
      {
        upsert: true, // Create a new user if it doesn't exist
        new: true, // Return the updated document
      }
    );
  } catch (error) {
    console.error("Error creating or updating user:", error);
  }
};

export default deleteUser = async (id) => {
  try {
    await dbconnect();

    // Delete user by clerkId
    const deletedUser = await User.findOneAndDelete({ clerkId: id });
    if (deletedUser) {
      console.log(`User deleted successfully.`);
    }
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};
