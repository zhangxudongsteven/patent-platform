"use client";

import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useDisclosureContext } from "../context";

export function Step1BasicInfo() {
  const {
    inventionName,
    setInventionName,
    contactPerson,
    setContactPerson,
    applicationType,
    setApplicationType,
    technicalField,
    setTechnicalField,
  } = useDisclosureContext();

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-6 text-xl font-semibold text-foreground">
          填写基本信息
        </h2>

        <div className="space-y-6">
          <div>
            <Label className="mb-2 block text-sm font-medium text-foreground">
              发明名称 *
            </Label>
            <Input
              type="text"
              value={inventionName}
              onChange={(e) => setInventionName(e.target.value)}
              placeholder="请输入发明创造的名称"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block text-sm font-medium text-foreground">
                联系人 *
              </Label>
              <Input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="请输入联系人姓名"
              />
            </div>
            <div>
              <Label className="mb-2 block text-sm font-medium text-foreground">
                申请类型 *
              </Label>
              <RadioGroup
                value={applicationType}
                onValueChange={(value) =>
                  setApplicationType(value as "发明" | "实用新型")
                }
                className="flex h-[42px] items-center gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="发明" id="type-invention" />
                  <Label htmlFor="type-invention">发明</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="实用新型" id="type-utility" />
                  <Label htmlFor="type-utility">实用新型</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium text-foreground">
              技术领域 *
            </Label>
            <div className="flex items-center gap-2 text-foreground">
              <span className="text-sm">本发明创造技术方案所属技术领域为</span>
              <input
                type="text"
                value={technicalField}
                onChange={(e) => setTechnicalField(e.target.value)}
                placeholder="请填写技术领域"
                className="flex-1 border-b-2 border-dashed border-primary bg-transparent px-2 py-1 text-sm outline-none focus:border-solid placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
