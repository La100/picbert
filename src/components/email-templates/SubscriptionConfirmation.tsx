import * as React from "react";

interface SubscriptionConfirmationProps {
  userName: string;
  planName: string;
  startDate: string;
  endDate: string;
  paymentAmount: string;
  tokens?: number; // Optional tokens field
}

const SubscriptionConfirmation: React.FC<Readonly<SubscriptionConfirmationProps>> = ({
  userName,
  planName,
  startDate,
  endDate,
  paymentAmount,
  tokens,
}) => (
  <div style={{ fontFamily: "Arial, sans-serif", color: "#333", maxWidth: "600px", margin: "0 auto" }}>
    <div style={{ padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "8px", marginBottom: "20px" }}>
      <h1 style={{ color: "#4f46e5", marginBottom: "16px" }}>Subscription Confirmed!</h1>
      <p style={{ fontSize: "16px", lineHeight: "1.5" }}>Hi {userName},</p>
      <p style={{ fontSize: "16px", lineHeight: "1.5" }}>
        Thank you for subscribing to our <strong>{planName}</strong> plan. Your subscription is now active.
      </p>
      <div style={{ margin: "24px 0", padding: "16px", backgroundColor: "#fff", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
        <h2 style={{ fontSize: "18px", color: "#4f46e5", marginBottom: "12px" }}>Subscription Details</h2>
        <p style={{ margin: "8px 0", fontSize: "14px" }}>
          <strong>Plan:</strong> {planName}
        </p>
        <p style={{ margin: "8px 0", fontSize: "14px" }}>
          <strong>Payment Amount:</strong> {paymentAmount}
        </p>
        <p style={{ margin: "8px 0", fontSize: "14px" }}>
          <strong>Start Date:</strong> {startDate}
        </p>
        <p style={{ margin: "8px 0", fontSize: "14px" }}>
          <strong>Next Billing Date:</strong> {endDate}
        </p>
        {tokens && (
          <p style={{ margin: "8px 0", fontSize: "14px" }}>
            <strong>Tokens Added:</strong> {tokens} tokens
          </p>
        )}
      </div>
      <p style={{ fontSize: "16px", lineHeight: "1.5" }}>
        You now have access to all the features included in your subscription plan. {tokens && `We also added ${tokens} tokens to your account.`} If you have any questions or need assistance, please don&apos;t hesitate to contact our support team.
      </p>
      <p style={{ fontSize: "16px", lineHeight: "1.5", marginTop: "24px" }}>
        Thank you for choosing our service!
      </p>
      <p style={{ fontSize: "16px", lineHeight: "1.5" }}>
        The Faces Factory Team
      </p>
    </div>
    <div style={{ textAlign: "center", fontSize: "12px", color: "#6b7280", padding: "12px" }}>
      <p>© {new Date().getFullYear()} Faces Factory. All rights reserved.</p>
    </div>
  </div>
);

export default SubscriptionConfirmation; 