export const sendEmailViaWebhook = async (webhookURL: string, body: any) => {
  await fetch(webhookURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-form-secret": "bushky11",
    },
    body: JSON.stringify(body),
  });

  console.log("email sent successfully");
};
