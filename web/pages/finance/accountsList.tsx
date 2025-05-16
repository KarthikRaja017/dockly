import { PlusOutlined } from "@ant-design/icons";
import { Card, Avatar, Button, Tooltip } from "antd";
import { ArrowRightOutlined, BarChartOutlined } from "@ant-design/icons";

const AccountCard = (props: any) => {
  const { name, balance, id } = props;
  const initial = name?.charAt(0).toUpperCase() || "?";
  const shortId = id?.slice(-6) || "------";
  const isNegative = parseFloat(balance.current) < 0;

  return (
    <Card
      style={{
        borderRadius: 16,
        background: "#e6f4ff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        marginBottom: 16,
        padding: 16,
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Avatar
            style={{
              backgroundColor: "#f5f5f5",
              color: "#555",
              fontWeight: "bold",
            }}
            size="large"
          >
            {initial}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600 }}>{name}</div>
            <div style={{ color: isNegative ? "#ff4d4f" : "#111" }}>
              $
              {parseFloat(balance.current).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </div>
            <div style={{ color: "#999" }}>••••{shortId}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Tooltip title="Transfer">
            <Button shape="circle" icon={<ArrowRightOutlined />} />
          </Tooltip>
          <Tooltip title="Analytics">
            <Button shape="circle" icon={<BarChartOutlined />} />
          </Tooltip>
        </div>
      </div>
    </Card>
  );
};

const AccountsList = (props: any) => {
  const { accountDetails } = props;

  return (
    <Card
      title="🏦 Accounts"
      extra={<Button shape="circle" icon={<PlusOutlined />} />}
      style={{
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        background: "#ffffff",
        maxWidth: 1500,
      }}
    >
      {(accountDetails ?? []).map((acct: any, idx: any) => (
        <AccountCard key={idx} {...acct} />
      ))}

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        block
        style={{ marginTop: 16, borderRadius: 8 }}
      >
        Add Account
      </Button>
    </Card>
  );
};

export default AccountsList;
