import Btn from "../ui/Btn.jsx";

export default function ChatButton({ onClick, small = true, children = "Chat" }) {
  return (
    <Btn small={small} variant="light" onClick={onClick}>
      💬 {children}
    </Btn>
  );
}
