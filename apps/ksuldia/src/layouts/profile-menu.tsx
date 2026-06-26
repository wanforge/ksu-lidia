"use client";

import { Title, Text, Avatar, Button, Popover } from "rizzui";
import cn from "@core/utils/class-names";
import { routes } from "@/config/routes";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { hasPermission, PERMISSIONS } from "@/lib/rbac/permissions";

const roleLabels: Record<string, string> = {
  ADMIN: "Administrator",
  VIEWER: "Viewer",
};

export default function ProfileMenu({
  buttonClassName,
  avatarClassName,
  username = false,
}: {
  buttonClassName?: string;
  avatarClassName?: string;
  username?: boolean;
}) {
  const { data: session } = useSession();
  const name = session?.user?.name ?? "Pengguna";
  const image = session?.user?.image ?? undefined;
  const firstName = name.split(" ")[0];

  return (
    <ProfileMenuPopover>
      <Popover.Trigger>
        <button
          className={cn(
            "w-9 shrink-0 rounded-full outline-none focus-visible:ring-[1.5px] focus-visible:ring-gray-400 focus-visible:ring-offset-2 active:translate-y-px sm:w-10",
            buttonClassName
          )}
        >
          <Avatar
            name={name}
            src={image}
            className={cn("!h-9 w-9 sm:!h-10 sm:!w-10", avatarClassName)}
          />
          {!!username && (
            <span className="username hidden text-gray-200 md:inline-flex dark:text-gray-700">
              Hi, {firstName}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Content className="z-[9999] p-0 dark:bg-gray-100 [&>svg]:dark:fill-gray-100">
        <DropdownMenu />
      </Popover.Content>
    </ProfileMenuPopover>
  );
}

function ProfileMenuPopover({ children }: React.PropsWithChildren<{}>) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      shadow="sm"
      placement="bottom-end"
    >
      {children}
    </Popover>
  );
}

function DropdownMenu() {
  const { data: session } = useSession();
  const name = session?.user?.name ?? "Pengguna";
  const email = session?.user?.email ?? "";
  const image = session?.user?.image ?? undefined;
  const role = (session?.user as { role?: string } | undefined)?.role;

  const menuItems: { name: string; href: string }[] = [];
  if (hasPermission(role, PERMISSIONS.DASHBOARD_VIEW)) {
    menuItems.push({ name: "Dashboard", href: routes.dashboard });
  }
  if (hasPermission(role, PERMISSIONS.PORTAL_VIEW)) {
    menuItems.push({ name: "Data Saya", href: routes.me.dashboard });
  }
  if (hasPermission(role, PERMISSIONS.AUDIT_VIEW)) {
    menuItems.push({ name: "Log Aktivitas", href: routes.audit.list });
  }

  return (
    <div className="w-64 text-left rtl:text-right">
      <div className="flex items-center border-b border-gray-300 px-6 pb-5 pt-6">
        <Avatar name={name} src={image} className="!h-12 !w-12 shrink-0" />
        <div className="ms-3 min-w-0">
          <Title as="h6" className="truncate font-semibold">
            {name}
          </Title>
          {email ? (
            <Text className="truncate text-gray-600">{email}</Text>
          ) : null}
          {role ? (
            <Text className="text-primary mt-0.5 text-xs font-medium">
              {roleLabels[role] ?? role}
            </Text>
          ) : null}
        </div>
      </div>
      <div className="grid px-3.5 py-3.5 font-medium text-gray-700">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="group my-0.5 flex items-center rounded-md px-2.5 py-2 hover:bg-gray-100 focus:outline-none hover:dark:bg-gray-50/50"
          >
            {item.name}
          </Link>
        ))}
      </div>
      <div className="border-t border-gray-300 px-6 pb-6 pt-5">
        <Button
          className="h-auto w-full justify-start p-0 font-medium text-gray-700 outline-none focus-within:text-gray-600 hover:text-gray-900 focus-visible:ring-0"
          variant="text"
          onClick={() => signOut({ callbackUrl: routes.signIn })}
        >
          Keluar
        </Button>
      </div>
    </div>
  );
}
