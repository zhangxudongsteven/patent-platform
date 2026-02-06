"use client";

import React from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { testConfig } from "./config";

export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Find current breadcrumb path
  const getBreadcrumbs = () => {
    const breadcrumbs: { title: string; url?: string }[] = [
      { title: "测试实验室", url: "/test" },
    ];

    for (const group of testConfig) {
      if (group.items) {
        const item = group.items.find((i) => i.url === pathname);
        if (item) {
          breadcrumbs.push({ title: group.title });
          breadcrumbs.push({ title: item.title, url: item.url });
          return breadcrumbs;
        }
      } else if (group.url === pathname) {
        breadcrumbs.push({ title: group.title, url: group.url });
        return breadcrumbs;
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>测试功能</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {testConfig.map((item) => {
                  const hasSubMenu = item.items && item.items.length > 0;

                  return (
                    <SidebarMenuItem key={item.title}>
                      {hasSubMenu ? (
                        <Collapsible defaultOpen className="group/collapsible">
                          <SidebarMenuButton asChild>
                            <CollapsibleTrigger suppressHydrationWarning>
                              {item.icon && <item.icon />}
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </CollapsibleTrigger>
                          </SidebarMenuButton>
                          <CollapsibleContent suppressHydrationWarning>
                            <SidebarMenuSub>
                              {item.items?.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={pathname === subItem.url}
                                  >
                                    <Link href={subItem.url!}>
                                      {subItem.icon && <subItem.icon />}
                                      <span>{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.url}
                        >
                          <Link href={item.url || "#"}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="w-px h-4 bg-border mx-2" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={crumb.title}>
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.url || "#"}>
                          {crumb.title}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
