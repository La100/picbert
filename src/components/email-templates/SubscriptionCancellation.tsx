import * as React from "react";

interface SubscriptionCancellationProps {
  userName: string;
  planName: string;
  endDate: string;
}

const SubscriptionCancellation: React.FC<Readonly<SubscriptionCancellationProps>> = ({
  userName,
  planName,
  endDate,
}) => (
  <div style={{ fontFamily: "Arial, sans-serif", color: "#333", maxWidth: "600px", margin: "0 auto" }}>
    <div style={{ padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "8px", marginBottom: "20px" }}>
      <h1 style={{ color: "#4f46e5", marginBottom: "16px" }}>Subscription Cancelled</h1>
      <p style={{ fontSize: "16px", lineHeight: "1.5" }}>Hi {userName},</p>
      <p style={{ fontSize: "16px", lineHeight: "1.5" }}>
        Thank you for using our <strong>{planName}</strong>. We're sorry to see you go, but we appreciate the time you spent with us.
      </p>
      <div style={{ margin: "24px 0", padding: "16px", backgroundColor: "#fff", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
        <h2 style={{ fontSize: "18px", color: "#4f46e5", marginBottom: "12px" }}>Cancellation Details</h2>
        <p style={{ margin: "8px 0", fontSize: "14px" }}>
          <strong>Plan:</strong> {planName}
        </p>
        <p style={{ margin: "8px 0", fontSize: "14px" }}>
          <strong>Access Until:</strong> {endDate}
        </p>
      </div>
      <p style={{ fontSize: "16px", lineHeight: "1.5" }}>
        You'll continue to have access to all premium features until your subscription period ends. We'd love to hear your feedback on how we could improve our service.
      </p>
      <p style={{ fontSize: "16px", lineHeight: "1.5", marginTop: "24px" }}>
        If you ever wish to rejoin us, we'll be happy to welcome you back anytime!
      </p>
      <p style={{ fontSize: "16px", lineHeight: "1.5" }}>
        Thank you again for your support.
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

export default SubscriptionCancellation; 