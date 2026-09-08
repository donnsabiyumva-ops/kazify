import { KazifyProvider, useKazify } from "./store/KazifyContext.jsx";
import Rail from "./components/Rail.jsx";
import SwipeDeck from "./components/SwipeDeck.jsx";
import Binder from "./components/Binder.jsx";
import SellerWorkspace from "./components/seller/SellerWorkspace.jsx";
import AuthFlow from "./components/AuthFlow.jsx";
import LandingPage from "./components/LandingPage.jsx";
import SettingsModal from "./components/SettingsModal.jsx";
import Toast from "./components/Toast.jsx";
import AccountOverlay from "./components/AccountOverlay.jsx";
import CreatorProfileOverlay from "./components/CreatorProfileOverlay.jsx";
import CheckoutModal from "./components/CheckoutModal.jsx";
import KycModal from "./components/KycModal.jsx";
import UploadServiceModal from "./components/UploadServiceModal.jsx";

function Shell() {
  const { state, me } = useKazify();
  const seller = state.role === "freelancer";

  if (!state.bootstrapped) return <div style={{ height: "100vh", background: "#ffffff" }} />;

  if (!me) {
    if (!state.auth) return <LandingPage />;
    return (
      <div style={{ height: "100vh", background: "#ffffff", color: "#0f172a" }}>
        <AuthFlow />
        <Toast />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", minHeight: 0, overflow: "hidden", background: "#ffffff", color: "#0f172a" }}>
      <Rail />
      {!seller && (
        <>
          <SwipeDeck />
          <Binder />
        </>
      )}
      {seller && <SellerWorkspace />}

      <SettingsModal />
      <AccountOverlay />
      <CreatorProfileOverlay />
      <CheckoutModal />
      <KycModal />
      <UploadServiceModal />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <KazifyProvider>
      <Shell />
    </KazifyProvider>
  );
}
