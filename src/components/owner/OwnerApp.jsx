import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { space } from "../../styles/tokens.js";
import Header from "../layout/Header.jsx";
import BottomNav from "../layout/BottomNav.jsx";
import OwnerHome from "./OwnerHome.jsx";
import BookingSearch from "./BookingSearch.jsx";
import VetsDirectory from "./VetsDirectory.jsx";
import VetPublicProfile from "./VetPublicProfile.jsx";
import DirectoryListingProfile from "./DirectoryListingProfile.jsx";
import BookingFlow from "./BookingFlow.jsx";
import MyPets from "./MyPets.jsx";
import PetDetail from "./PetDetail.jsx";
import OwnerAppts from "./OwnerAppts.jsx";
import ReviewForm from "./ReviewForm.jsx";
// OwnerDocs non è nel bottom nav principale (accessible da profilo/visite)
import OwnerProfile from "./OwnerProfile.jsx";
import NotificationPanel from "../layout/NotificationPanel.jsx";
import LegalFooter from "../legal/LegalFooter.jsx";
import ChatInbox from "../chat/ChatInbox.jsx";
import ChatThread from "../chat/ChatThread.jsx";
import usePersistedState from "../../hooks/usePersistedState.js";

export default function OwnerApp({ onLogout, onNav }) {
  const { ownerProfile, appts, vets, notifications, unreadCount, markRead, markAllRead, unreadMessageCount } = useApp();
  const proposalCount = appts.filter((a) => a.proposal && a.proposal.from === "vet").length;

  // Tab principali: Home · Prenota · Veterinari · Visite · Animali
  const [tab, setTab] = usePersistedState("mv.owner.activeTab", "home", window.sessionStorage);

  // Overlay/flow state
  const [bookingVet, setBookingVet] = useState(null);
  const [preSelectedServiceId, setPreSelectedServiceId] = useState(null);
  const [preSelectedSlot, setPreSelectedSlot] = useState(null); // slot precompilato da SlotCard
  const [viewVet, setViewVet] = useState(null);
  const [viewPet, setViewPet] = useState(null);
  const [reviewFor, setReviewFor] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChatInbox, setShowChatInbox] = useState(false);
  const [chatThread, setChatThread] = useState(null);

  // Filtri precompilati dalla Home → tab Prenota
  const [bookingFilters, setBookingFilters] = useState(null);

  const tabs = [
    ["home", "🏠", "Home"],
    ["booking", "🗓️", "Prenota"],
    ["vets", "👩‍⚕️", "Veterinari"],
    ["appts", "📅", "Visite"],
    ["pets", "🐾", "Animali"],
  ];

  const resetOverlays = () => {
    setViewVet(null);
    setBookingVet(null);
    setPreSelectedServiceId(null);
    setPreSelectedSlot(null);
    setViewPet(null);
    setReviewFor(null);
    setShowProfile(false);
    setShowNotifications(false);
    setShowChatInbox(false);
    setChatThread(null);
  };

  // Home → "Mostra slot disponibili" con filtri precompilati
  const handleBookingSearch = (filters) => {
    setBookingFilters(filters);
    resetOverlays();
    setTab("booking");
  };

  // Booking da SlotCard o VetsDirectory → apre BookingFlow con slot precompilato
  const handleBookSlot = (slot) => {
    setPreSelectedSlot(slot);
    setBookingVet(slot.vet);
    setPreSelectedServiceId(null);
  };

  // Booking da VetPublicProfile (pulsante generico "Prenota")
  const handleBookVet = (vet) => {
    setBookingVet(vet);
    setPreSelectedSlot(null);
    setPreSelectedServiceId(null);
  };

  // VetPublicProfile con slot precompilato (clic su chip slot)
  const handleBookVetSlot = (slot) => {
    setPreSelectedSlot(slot);
    setBookingVet(slot.vet);
    setViewVet(null);
  };

  const handleRebook = (appt) => {
    const vet = appts && vets.find((v) => v.id === appt.vetId);
    if (!vet) return;
    resetOverlays();
    setBookingVet(vet);
    setPreSelectedServiceId(appt.serviceId || null);
    setPreSelectedSlot(null);
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", paddingBottom: 86 }}>
      <Header
        title="MioVeterinario"
        subtitle={`Area Proprietario · ${ownerProfile.name}`}
        onLogout={onLogout}
        onProfile={() => {
          resetOverlays();
          setShowProfile(true);
        }}
        unreadCount={unreadCount}
        chatUnreadCount={unreadMessageCount}
        avatar={ownerProfile.avatar}
        onChat={() => {
          resetOverlays();
          setShowChatInbox(true);
        }}
        onNotifications={() => {
          resetOverlays();
          setShowNotifications(true);
        }}
      />
      <div style={{ padding: space["3xl"] }}>
        {showNotifications ? (
          <NotificationPanel
            notifications={notifications}
            onMarkRead={markRead}
            onMarkAllRead={markAllRead}
            onClose={() => setShowNotifications(false)}
            onOpenNotification={(notification) => {
              if (notification.type === "message_received" && notification.data?.threadId) {
                setShowNotifications(false);
                setChatThread({
                  threadId: notification.data.threadId,
                  vetId: notification.data.vetId,
                  ownerId: "demo-owner",
                  apptId: notification.data.apptId,
                });
              } else if (notification.type?.startsWith("appt")) {
                setShowNotifications(false);
                setTab("appts");
              }
            }}
          />
        ) : showProfile ? (
          <OwnerProfile onBack={() => setShowProfile(false)} />
        ) : chatThread ? (
          <ChatThread
            {...chatThread}
            ownerId={chatThread.ownerId || "demo-owner"}
            currentRole="owner"
            onBack={() => setChatThread(null)}
          />
        ) : showChatInbox ? (
          <ChatInbox role="owner" onOpenThread={(thread) => setChatThread(thread)} />
        ) : viewVet ? (
          viewVet.isDirectory ? (
            <DirectoryListingProfile listing={viewVet} onBack={() => setViewVet(null)} />
          ) : (
            <VetPublicProfile
              vet={viewVet}
              onBack={() => setViewVet(null)}
              onBook={() => {
                handleBookVet(viewVet);
                setViewVet(null);
              }}
              onBookSlot={(slot) => {
                handleBookVetSlot(slot);
              }}
              onChat={(vet) => {
                setViewVet(null);
                setChatThread({ threadId: `demo-owner_${vet.id}`, vetId: vet.id, ownerId: "demo-owner" });
              }}
            />
          )
        ) : bookingVet ? (
          <BookingFlow
            vet={bookingVet}
            preSelectedServiceId={preSelectedServiceId}
            initialPetId={preSelectedSlot?.initialPetId}
            initialServiceId={preSelectedSlot?.serviceId}
            initialDate={preSelectedSlot?.date}
            initialTime={preSelectedSlot?.time}
            initialType={preSelectedSlot?.type}
            onDone={() => {
              setBookingVet(null);
              setPreSelectedServiceId(null);
              setPreSelectedSlot(null);
              setTab("appts");
            }}
            onCancel={() => {
              setBookingVet(null);
              setPreSelectedServiceId(null);
              setPreSelectedSlot(null);
            }}
          />
        ) : viewPet ? (
          <PetDetail pet={viewPet} onBack={() => setViewPet(null)} />
        ) : reviewFor ? (
          <ReviewForm appt={reviewFor} onDone={() => setReviewFor(null)} />
        ) : (
          <>
            {tab === "home" && (
              <OwnerHome
                goSearch={() => {
                  resetOverlays();
                  setTab("vets");
                }}
                goPets={() => {
                  resetOverlays();
                  setTab("pets");
                }}
                goServiceSearch={() => {
                  resetOverlays();
                  setTab("booking");
                }}
                onBookingSearch={handleBookingSearch}
              />
            )}
            {tab === "booking" && (
              <BookingSearch
                key={JSON.stringify(bookingFilters || {})}
                initialFilters={bookingFilters}
                onBook={handleBookSlot}
                onViewVet={(vet) => setViewVet(vet)}
                onChatVet={(vet) =>
                  setChatThread({ threadId: `demo-owner_${vet.id}`, vetId: vet.id, ownerId: "demo-owner" })
                }
                onViewAllVets={() => {
                  resetOverlays();
                  setTab("vets");
                }}
              />
            )}
            {tab === "vets" && (
              <VetsDirectory
                onView={(vet) => setViewVet(vet)}
                onBookSlot={handleBookSlot}
                onChatVet={(vet) =>
                  setChatThread({ threadId: `demo-owner_${vet.id}`, vetId: vet.id, ownerId: "demo-owner" })
                }
              />
            )}
            {tab === "appts" && (
              <OwnerAppts
                onReview={setReviewFor}
                onRebook={handleRebook}
                onChatVet={(vet, appt) =>
                  setChatThread({
                    threadId: `demo-owner_${vet.id}`,
                    vetId: vet.id,
                    ownerId: "demo-owner",
                    apptId: appt?.id,
                  })
                }
                onGoSearch={() => {
                  resetOverlays();
                  setTab("booking");
                }}
              />
            )}
            {tab === "pets" && <MyPets onView={setViewPet} />}
          </>
        )}
      </div>
      <LegalFooter onNav={onNav} />
      <BottomNav
        tabs={tabs}
        active={tab}
        onChange={(t) => {
          setTab(t);
          resetOverlays();
          if (t !== "booking") setBookingFilters(null);
        }}
        badges={proposalCount > 0 ? { appts: proposalCount } : {}}
      />
    </div>
  );
}
