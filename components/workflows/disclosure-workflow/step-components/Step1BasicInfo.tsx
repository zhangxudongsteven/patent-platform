"use client";

import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
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
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-6 text-xl font-semibold text-foreground">
          填写基本信息
        </h2>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="invention-name">发明名称 *</FieldLabel>
            <Input
              id="invention-name"
              type="text"
              value={inventionName}
              onChange={(e) => setInventionName(e.target.value)}
              placeholder="请输入发明创造的名称"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="contact-person">联系人 *</FieldLabel>
              <Input
                id="contact-person"
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="请输入联系人姓名"
              />
            </Field>
            <FieldSet>
              <FieldLegend variant="label">申请类型 *</FieldLegend>
              <RadioGroup
                value={applicationType}
                onValueChange={(value) =>
                  setApplicationType(value as "发明" | "实用新型")
                }
                className="flex h-[42px] items-center gap-4"
              >
                <Field orientation="horizontal" className="w-auto gap-2">
                  <RadioGroupItem value="发明" id="type-invention" />
                  <FieldLabel htmlFor="type-invention">发明</FieldLabel>
                </Field>
                <Field orientation="horizontal" className="w-auto gap-2">
                  <RadioGroupItem value="实用新型" id="type-utility" />
                  <FieldLabel htmlFor="type-utility">实用新型</FieldLabel>
                </Field>
              </RadioGroup>
            </FieldSet>
          </div>

          <Field>
            <FieldLabel htmlFor="technical-field">技术领域 *</FieldLabel>
            <FieldContent>
              <FieldDescription>
                本发明创造技术方案所属技术领域
              </FieldDescription>
              <Input
                id="technical-field"
                type="text"
                value={technicalField}
                onChange={(e) => setTechnicalField(e.target.value)}
                placeholder="请填写技术领域"
              />
            </FieldContent>
          </Field>
        </FieldGroup>
      </div>
    </div>
  );
}
