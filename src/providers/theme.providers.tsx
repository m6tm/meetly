"use client";

import { getAppearanceAction } from "@/actions/account.actions";
import { userStore } from "@/stores/user.store";
import { useCallback, useEffect } from "react";

export default function ThemeProvider() {
  const { appearance, setTheme, setAppearance } = userStore()

  // Memoize the loadAppearance function
  const loadAppearance = useCallback(async () => {
    const response = await getAppearanceAction();
    if (response.success && response.data) {
      setTheme(response.data.theme);
      setAppearance(response.data);
    }
  }, [setTheme, setAppearance]);

  // Load appearance on mount if not already loaded
  useEffect(() => {
    if (!appearance) {
      loadAppearance();
    }
  }, [appearance, loadAppearance]);
  return <>
  </>;
}