import { Input } from "antd";

export const DocklyLogo = () => {
  return (
    <div
      style={{
        flex: 1.1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#007B8F",
      }}
    >
      <img
        src="/logo.png"
        alt="Dockly Logo"
        style={{
          maxWidth: "60%",
          height: "auto",
        }}
      />
    </div>
  );
};

export const PRIMARY_COLOR = "#0033FF";
export const ACTIVE_BG_COLOR = "#92D3F5";
export const ACTIVE_TEXT_COLOR = PRIMARY_COLOR;
export const DEFAULT_TEXT_COLOR = "#343434";
export const SIDEBAR_BG = "#f9fafa";

export const LowercaseInput = (props: any) => {
  const { value, onChange, ...restProps } = props;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lowerValue = e.target.value.toLowerCase();
    onChange?.(lowerValue);
  };

  return <Input {...restProps} value={value} onChange={handleChange} />;
};

export const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 4 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  } else if (hour >= 17 && hour < 21) {
    return "Good evening";
  } else {
    return "Good night";
  }
};

export const capitalizeEachWord = (text: string): string => {
  if (!text) return "";
  return text
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};