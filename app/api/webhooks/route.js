import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { clerkClient } from "@clerk/nextjs/server";
import { createOrUpdateUser, deleteUser } from "@/app/lib/actions/user";

export async function POST(req) {
  try {
    const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

    const evt = await verifyWebhook(req, {
      signingSecret: SIGNING_SECRET,
    });

    // Do something with payload
    // For this guide, log payload to console
    const { id } = evt?.data;
    const eventType = evt?.type;

    if (eventType === "user.created" || eventType === "user.updated") {
      const { first_name, last_name, image_url, email_addresses } = evt?.data;
      try {
        const user = await createOrUpdateUser(
          id,
          first_name,
          last_name,
          image_url,
          email_addresses
        );

        if (user && eventType === "user.created") {
          try {
            await clerkClient.users.updateUserMetadata(id, {
              publicMetadata: {
                userMongoId: user._id,
              },
            });
          } catch (error) {
            console.error("Error updating user metadata:", error);
          }
        }
      } catch (error) {
        console.error("Error creating or updating user:", error);
      }
    }
    if (eventType === "user.deleted") {
      try {
        await deleteUser(id);
        console.log("User deleted successfully:", id);
      } catch (error) {
        console.error("Error deleting user:", error);
        return new Response("Error deleting user", { status: 400 });
      }
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
