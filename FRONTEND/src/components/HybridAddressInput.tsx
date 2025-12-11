import React, { useState } from "react";
import { Button, Input, Space } from "antd";
import {
    EditOutlined,
    EnvironmentOutlined,
    RollbackOutlined,
} from "@ant-design/icons";
import MapPicker from "./MapPicker";
import AutoInput from "./AutoInput";
import type { AddressData, MapLocation, Coordinate } from "../types/cargo";

interface Props {
    value?: AddressData | string;
    onChange: (v: AddressData | string) => void;
    fetchSuggestions: (q: string) => Promise<any[]>;
    placeholder?: string;
}

const HybridAddressInput: React.FC<Props> = ({
    value,
    onChange,
    fetchSuggestions,
    placeholder,
}) => {
    const [mode, setMode] = useState<"auto" | "map">("auto");

    const address = typeof value === "string" ? value : value?.address ?? "";
    const coords: Coordinate | undefined =
        typeof value === "string" ? undefined : value?.coords;

    // ручной ввод
    const handleAutoChange = (v: string | AddressData) => {
        if (typeof v === "string") {
            onChange(v);
        } else {
            onChange({ ...v, isValid: true });
        }
    };

    // выбор на карте
    const handleMapSelect = (loc: MapLocation) => {
        onChange({
            address: loc.address,
            coords: loc.coords,
            isValid: true,
        });
    };

    return (
        <div style={{ width: "100%" }}>
            {mode === "auto" && (
                <Space.Compact style={{ width: "100%" }}>
                    <AutoInput
                        value={address}
                        placeholder={placeholder}
                        fetchSuggestions={fetchSuggestions}
                        onChange={handleAutoChange}
                    />

                    <Button
                        icon={<EnvironmentOutlined />}
                        onClick={() => setMode("map")}
                        title="Выбрать на карте"
                    />
                </Space.Compact>
            )}

            {mode === "map" && (
                <div>
                    <Space style={{ marginBottom: 8,  width: "80%"  }}>
                        <Input
                            value={address}
                            readOnly
                            style={{ width: 200 }}
                        />

                        <Button
                            icon={<EditOutlined />}
                            onClick={() => setMode("auto")}
                        />
                    </Space>

                    <MapPicker
                        onLocationSelect={handleMapSelect}
                        initialLocation={coords ?? undefined}
                        initialAddress={address}
                    />
                </div>
            )}
        </div>
    );
};

export default HybridAddressInput;
