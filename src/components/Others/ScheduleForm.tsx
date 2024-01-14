import React, { useState, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScheduleSchema } from "../../models/Schedule";
import type { ScheduleForm } from "../../models/Schedule";
import InputText from "../UI/Form/InputText";
import { useTranslation } from "react-i18next";
import Select from "../UI/Form/Select";
import InputNumber from "../UI/Form/InputNumber";
import { Category, Channel, Quality } from "../../type";
import Checkbox from "../UI/Form/CheckBox";
import { ApiRoutes, getApiRoute } from "../../type/routes";
import Button from "../UI/Button/Button";

const minTimeBeforeDelete = 10;
const minViewersCount = 0;

interface DefaultValue {
    isChannelNameDisabled: boolean;
    channelName: string;
    isDeleteRediff: boolean;
    hasTags: boolean;
    hasMinView: boolean;
    hasCategory: boolean;
    quality: Quality;
    category: string;
    timeBeforeDelete: number;
    viewersCount: number;
}

interface ModalProps {
    onClose: any;
    onDelete: any;
}

interface ScheduleFormProps {
    defaultValue?: DefaultValue;
    modal?: ModalProps;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({
    modal,
    defaultValue = {
        isChannelNameDisabled: false,
        channelName: "",
        isDeleteRediff: false,
        hasTags: false,
        hasMinView: false,
        hasCategory: false,
        quality: Quality.LOW,
        category: "",
        timeBeforeDelete: minTimeBeforeDelete,
        viewersCount: minViewersCount,
    },
}) => {
    const { t } = useTranslation();
    const isModal = !!modal;
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [possibleMatches, setPossibleMatches] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const urlCategory = getApiRoute(ApiRoutes.GET_CATEGORY);
            const urlFollowedChannels = getApiRoute(ApiRoutes.GET_USER_FOLLOWED_CHANNELS);

            try {
                const [categoryResponse, followedChannelsResponse] = await Promise.all([
                    fetch(urlCategory, { credentials: "include" }),
                    fetch(urlFollowedChannels, { credentials: "include" }),
                ]);

                if (!categoryResponse.ok || !followedChannelsResponse.ok) {
                    throw new Error("HTTP error");
                }

                const [categoryData, followedChannelsData] = await Promise.all([
                    categoryResponse.json(),
                    followedChannelsResponse.json(),
                ]);

                setCategories(categoryData);
                setValue("category", defaultValue.category !== "" ? defaultValue.category : categoryData[0]?.name);
                setChannels(followedChannelsData);
            } catch (error) {
                console.error(`Error fetching data: ${error}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const postData = async (data: ScheduleForm) => {
        try {
            let url = "";
            let method = "";

            if (isModal) {
                url = getApiRoute(ApiRoutes.PUT_DOWNLOAD_SCHEDULE_EDIT);
                method = "PUT";
            } else {
                url = getApiRoute(ApiRoutes.POST_DOWNLOAD_SCHEDULE);
                method = "POST";
            }

            const response = await fetch(url, {
                method: method,
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error posting data: ${error}`);
        }
    };

    const checkChannelNameValidity = async (channelName: string) => {
        try {
            const url = getApiRoute(ApiRoutes.GET_CHANNEL_NAME_NAME, "name", channelName);
            const response = await fetch(url, {
                credentials: "include",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.exists;
        } catch (error) {
            console.error(`Error fetching data: ${error}`);
            return false;
        }
    };

    // category: defaultValue.category.length
    //     ? defaultValue.category[0].name
    //     : categories.length
    //       ? categories[0].name
    //       : "",

    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        trigger,
        // formState: { errors, isValid },
        formState: { errors },
        watch,
        setValue,
    } = useForm<ScheduleForm>({
        resolver: zodResolver(ScheduleSchema),
        defaultValues: {
            channelName: defaultValue.channelName,
            isDeleteRediff: defaultValue.isDeleteRediff,
            hasTags: defaultValue.hasTags,
            hasMinView: defaultValue.hasMinView,
            hasCategory: defaultValue.hasCategory,
            quality: defaultValue.quality,
            category: defaultValue.category !== "" ? defaultValue.category : categories[0]?.name,
            timeBeforeDelete: defaultValue.timeBeforeDelete,
            viewersCount: defaultValue.viewersCount,
        },
    });

    const channelName = watch("channelName");
    const isDeleteRediff = watch("isDeleteRediff");
    const hasTags = watch("hasTags");
    const hasMinView = watch("hasMinView");
    const hasCategory = watch("hasCategory");

    const onSubmit: SubmitHandler<ScheduleForm> = async (data) => {
        const exists = await checkChannelNameValidity(data.channelName);
        if (!exists) {
            setError("channelName", {
                type: "manual",
                message: "Channel name doesn't exist",
            });
            return;
        }
        postData(data);
    };

    // const allValues = watch();
    // console.log(allValues);
    // console.log("Est valide: %s", isValid);

    const handleBlur = async (fieldName: keyof ScheduleForm) => {
        const isValid = await trigger(fieldName);
        if (!isValid) return;
        if (fieldName === "channelName") {
            const exists = await checkChannelNameValidity(channelName);
            if (!exists) {
                setError("channelName", {
                    type: "manual",
                    message: "Channel name dont exist",
                });
            } else {
                clearErrors("channelName");
            }
        }
    };

    const handleChange = async (fieldName: keyof ScheduleForm, value: string) => {
        if (fieldName === "channelName") {
            if (value.length > 0) {
                const matches = channels
                    .filter((channel) => channel?.broadcasterName?.toLowerCase().startsWith(value.toLowerCase()))
                    .map((channel) => channel.broadcasterName);
                setPossibleMatches(matches);
            } else {
                setPossibleMatches([]);
            }
        }
    };

    if (isLoading) {
        return <div>{t("Loading")}</div>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className=" p-4 md:p-5">
                <InputText
                    label={t("Channel Name")}
                    id="channelName"
                    placeholder={t("Channel Name")}
                    required={true}
                    list="possible-matches"
                    register={register("channelName")}
                    disabled={defaultValue.isChannelNameDisabled}
                    error={errors.channelName}
                    onBlur={() => handleBlur("channelName")}
                    onChange={(e: { target: { value: string } }) => handleChange("channelName", e.target.value)}
                />
                <datalist id="possible-matches">
                    {possibleMatches.map((match, index) => (
                        <option key={index} value={match} />
                    ))}
                </datalist>

                <div className="mt-5">
                    <Select
                        label={t("Video quality")}
                        id="quality"
                        register={register("quality", { required: true })}
                        required={true}
                        error={errors.quality}
                        options={[Quality.LOW, Quality.MEDIUM, Quality.HIGH]}
                    />
                </div>
                <div className="mt-5">
                    <Checkbox
                        label={t("Deletion of the video if the VOD is kept after the stream")}
                        helperText={t("Set the stream end time in minutes before the VOD is suppressed")}
                        id="isDeleteRediff"
                        error={errors.isDeleteRediff}
                        register={register("isDeleteRediff")}
                    />
                    <InputNumber
                        id="timeBeforeDelete"
                        register={register("timeBeforeDelete")}
                        error={errors.timeBeforeDelete}
                        required={false}
                        disabled={!isDeleteRediff}
                        minValue={minTimeBeforeDelete}
                    />
                </div>

                <div className="mt-5">
                    <Checkbox
                        label={t("Minimum number of views")}
                        id="hasMinView"
                        error={errors.hasMinView}
                        register={register("hasMinView")}
                    />
                    <InputNumber
                        id="viewersCount"
                        register={register("viewersCount")}
                        error={errors.viewersCount}
                        required={false}
                        disabled={!hasMinView}
                        minValue={minViewersCount}
                    />
                </div>
                <div className="mt-5">
                    <Checkbox
                        label={t("Game category")}
                        id="hasCategory"
                        error={errors.hasCategory}
                        register={register("hasCategory")}
                    />
                    <Select
                        id="category"
                        register={register("category", { required: true })}
                        required={false}
                        error={errors.category}
                        options={categories.map((category) => category.name)}
                        disabled={!hasCategory}
                    />
                </div>
                <div className="mt-5">
                    <Checkbox
                        label={t("Twitch tags")}
                        id="hasTags"
                        error={errors.hasTags}
                        register={register("hasTags")}
                    />
                    <InputText
                        id="tag"
                        placeholder={t("Twitch tags separate by ,")}
                        required={false}
                        list=""
                        register={register("tag")}
                        error={errors.tag}
                        onBlur={() => handleBlur("tag")}
                        disabled={!hasTags}
                    />
                </div>
            </div>
            {!isModal && (
                <div className="mt-5">
                    <Button
                        text={t("Add Schedule")}
                        typeButton="submit"
                        disabled={Object.keys(errors).length > 0}
                    />
                </div>
            )}
            {isModal && (
                <div className="mt-4 flex items-center justify-between rounded-b border-t-2  border-gray-200 p-4 dark:border-custom_delft_blue md:p-5">
                    <Button onClick={modal.onDelete} style="primary">
                        {t("Delete")}
                    </Button>
                    <div className="flex gap-3">
                        <Button onClick={modal.onClose} style="primary">
                            {t("Cancel")}
                        </Button>
                        <Button
                            text={t("Save")}
                            typeButton="submit"
                            style="cta"
                            disabled={Object.keys(errors).length > 0}
                        />
                    </div>
                </div>
            )}
        </form>
    );
};

export default ScheduleForm;