import {
  collection,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "../shared/firebase";
import { formatDate } from "../shared/utils";

let cache: { [key: string]: any } = {};

export const useLastMessage = (conversationId: string) => {
  const [data, setData] = useState<string | null>(
    cache[conversationId] || null
  );
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, "conversations", conversationId, "messages"),
        orderBy("createdAt"),
        limitToLast(1)
      ),
      (snapshot) => {
        if (snapshot.empty) {
          setData("No message recently");
          return;
        }
        const type = snapshot.docs?.[0]?.data()?.type;
        const response =
          type === "image"
            ? "An image"
            : type === "file"
            ? `File: ${
                snapshot.docs[0]?.data()?.file?.name.split(".").slice(-1)[0]
              }`
            : type === "sticker"
            ? "A sticker"
            : type === "removed"
            ? "Message removed"
            : snapshot.docs[0].data().content.length > 20
            ? `${snapshot.docs[0].data().content.slice(0, 20)}...`
            : snapshot.docs[0].data().content;

        const seconds = snapshot.docs[0]?.data()?.createdAt?.seconds;
        const formattedDate = formatDate(seconds ? seconds * 1000 : Date.now());
        const result = `${response} • ${formattedDate}`;
        setData(result);
        cache[conversationId] = result;
        setLoading(false);
        setError(false);
      },
      (err) => {
        console.log(err);
        setData(null);
        setLoading(false);
        setError(true);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [conversationId]);

  return { data, loading, error };
};
