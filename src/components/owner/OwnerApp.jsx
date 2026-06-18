import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { space } from "../../styles/tokens.js";
import Header from "../layout/Header.jsx";
import BottomNav from "../layout/BottomNav.jsx";
import OwnerHome from "./OwnerHome.jsx";
import SearchVets from "./SearchVets.jsx";
import VetPublicProfile from "./VetPublicProfile.jsx";
import BookingFlow from "./BookingFlow.jsx";
import MyPets from "./MyPets.jsx";
import PetDetail from "./PetDetail.jsx";
import OwnerAppts from "./OwnerAppts.jsx";
import ReviewForm from "./ReviewForm.jsx";
import OwnerDocs from "./OwnerDocs.jsx";
import OwnerProfile from "./OwnerProfile.jsx";
import LegalFooter from "../legal/LegalFooter.jsx";

export default function OwnerApp({ onLogout, onNav }) {
  const { ownerProfile } = useApp();
  const [tab, setTab] = useState("home");
  const [bookingVet, setBookingVet] = useState(null);
  const [viewVet, setViewVet] = useState(null);
  const [viewPet, setViewPet] = useState(null);
  const [reviewFor, setReviewFor] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const tabs = [
    ["home", "🏠", "Home"], ["search", "🔍", "Cerca"], ["pets", "🐾", "Animali"],
    ["appts", "📅", "Visite"], ["docs", "📄", "Referti"],
  ];

  const resetOverlays = () => { setViewVet(null); setBookingVet(null); setViewPet(null); setReviewFor(null); setShowProfile(false); };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", paddingBottom: 86 }}>
      <Header title="MioVeterinario" subtitle={`Area Proprietario · ${ownerProfile.name}`} onLogout={onLogout} onProfile={() => { resetOverlays(); setShowProfile(true); }} />
      <div style={{ padding: space["3xl"] }}>
        {showProfile ? (
          <OwnerProfile onBack={() => setShowProfile(false)} />
        ) : viewVet ? (
          <VetPublicProfile vet={viewVet} onBack={() => setViewVet(null)} onBook={() => { setBookingVet(viewVet); setViewVet(null); }} />
        ) : bookingVet ? (
          <BookingFlow vet={bookingVet} onDone={() => { setBookingVet(null); setTab("appts"); }} onCancel={() => setBookingVet(null)} />
        ) : viewPet ? (
          <PetDetail pet={viewPet} onBack={() => setViewPet(null)} />
        ) : reviewFor ? (
          <ReviewForm appt={reviewFor} onDone={() => setReviewFor(null)} />
        ) : (
          <>
            {tab === "home" && <OwnerHome goSearch={() => setTab("search")} goPets={() => setTab("pets")} />}
            {tab === "search" && <SearchVets onView={setViewVet} />}
            {tab === "pets" && <MyPets onView={setViewPet} />}
            {tab === "appts" && <OwnerAppts onReview={setReviewFor} />}
            {tab === "docs" && <OwnerDocs />}
          </>
        )}
      </div>
      <LegalFooter onNav={onNav} />
      <BottomNav tabs={tabs} active={tab} onChange={(t) => { setTab(t); resetOverlays(); }} />
    </div>
  );
}
