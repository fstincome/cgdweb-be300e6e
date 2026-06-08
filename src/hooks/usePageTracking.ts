import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

function getVisitorId() {
  let id = localStorage.getItem("visitor_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("visitor_id", id);
  }
  return id;
}

async function getCountry(): Promise<string | null> {
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    return data.country_name || null;
  } catch {
    return null;
  }
}

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    const track = async () => {
      const country = await getCountry();
      await supabase.from("page_views").insert({
        page_path: location.pathname,
        visitor_id: getVisitorId(),
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
        country,
      });
    };
    track();
  }, [location.pathname]);
}
