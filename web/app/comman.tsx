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
          src="/logo.png" // Directly reference the image from the public folder
          alt="Dockly Logo"
          style={{
            maxWidth: "60%",
            height: "auto",
          }}
        />
      </div>
    );
  };
  