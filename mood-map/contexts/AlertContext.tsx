import React, { createContext, useContext, useState, useCallback } from "react";
import AlertDialog, { AlertButton } from "@/components/ui/AlertDialog";

interface AlertOptions {
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

/**
 * Alert Provider Component
 *
 * Provides a global alert system that can be used throughout the app.
 * Wrap your app with this provider to enable the useAlert hook.
 */
export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alertOptions, setAlertOptions] = useState<AlertOptions | null>(null);

  const showAlert = useCallback((options: AlertOptions) => {
    console.log("AlertContext: showAlert called with", options);
    setAlertOptions(options);
  }, []);

  const hideAlert = useCallback(() => {
    setAlertOptions(null);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {alertOptions && (
        <>
          {console.log(
            "AlertContext: Rendering AlertDialog with",
            alertOptions
          )}
          <AlertDialog
            visible={!!alertOptions}
            title={alertOptions.title}
            message={alertOptions.message}
            buttons={alertOptions.buttons}
            onDismiss={hideAlert}
          />
        </>
      )}
    </AlertContext.Provider>
  );
}

/**
 * useAlert Hook
 *
 * A convenient hook to show alerts from anywhere in your app.
 *
 * @example
 * const alert = useAlert();
 *
 * // Simple alert
 * alert.show({ title: "Success", message: "Entry created!" });
 *
 * // Alert with custom buttons
 * alert.show({
 *   title: "Delete Entry",
 *   message: "Are you sure?",
 *   buttons: [
 *     { text: "Cancel", style: "cancel" },
 *     { text: "Delete", style: "destructive", onPress: handleDelete }
 *   ]
 * });
 */
export function useAlert() {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }

  return {
    show: context.showAlert,
    hide: context.hideAlert,
  };
}
