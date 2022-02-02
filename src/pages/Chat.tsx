import ChatHeader from "../components/Chat/ChatHeader";
import ChatView from "../components/Chat/ChatView";
import { ConversationInfo } from "../shared/types";
import { FC } from "react";
import InputSection from "../components/Chat/InputSection";
import SideBar from "../components/Home/SideBar";
import { db } from "../shared/firebase";
import { doc } from "firebase/firestore";
import { useDocumentQuery } from "../hooks/useDocumentQuery";
import { useParams } from "react-router-dom";
import { useStore } from "../store";

const Chat: FC = () => {
  const { id } = useParams();

  const { data, loading, error } = useDocumentQuery(
    `conversation-${id}`,
    doc(db, "conversations", id as string)
  );

  const conversation = data?.data() as ConversationInfo;

  const currentUser = useStore((state) => state.currentUser);

  return (
    <div className="flex">
      <SideBar />

      <div className="flex-grow flex flex-col items-stretch">
        {loading ? (
          <>
            <div className="h-20 border-b border-dark-lighten"></div>
            <div className="flex-grow"></div>
            <InputSection disabled />
          </>
        ) : !conversation ||
          error ||
          !conversation.users.includes(currentUser?.uid as string) ? (
          <div className="w-full h-full flex flex-col justify-center items-center gap-6">
            <img className="w-32 h-32 object-cover" src="/error.svg" alt="" />
            <p className="text-lg text-center">Conversation does not exists</p>
          </div>
        ) : (
          <>
            <ChatHeader conversation={conversation} />
            <ChatView key={id} conversation={conversation} />
            <InputSection disabled={false} />
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
