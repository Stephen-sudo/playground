import { clerkClient } from "@clerk/nextjs/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { createOrUpdateUser, deleteUser } from "@/lib/actions/user";

export async function POST(req) {
  try {
    const evt = await verifyWebhook(
      { req },
      { signingSecret: process.env.CLERK_WEBHOOK_SIGNING_SECRET }
    );

    // Do something with payload
    // For this guide, log payload to console
    const { id } = evt?.data;
    const eventType = evt?.type;

    if (eventType === "user.created" || eventType === "user.updated") {
      const { first_name, last_name, email_addresses, image_url } = evt?.data;

      try {
        const user = await createOrUpdateUser({
          id,
          email_addresses,
          first_name,
          last_name,
          image_url,
        });

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
        return new Response("Failed to create or update user", { status: 500 });
      }
    }

    if (eventType === "user.deleted") {
      try {
        await deleteUser(id);
      } catch (error) {
        console.error("Error deleting user:", error);
        return new Response("Failed to delete user", { status: 500 });
      }
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
