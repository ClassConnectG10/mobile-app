import { View, ScrollView } from "react-native";
import {
    Appbar,
    Button,
    IconButton,
    Text,
    TextInput,
    useTheme,
} from "react-native-paper";
import { useRouter } from "expo-router";
import OptionPicker from "@/components/OptionPicker";
import {
    levels,
    modalities,
    categories,
} from "@/utils/constants/courseDetails";
import { useCourseDetails } from "@/hooks/useCourseDetails";
import { globalStyles } from "@/styles/globalStyles";
import { DatePickerButton } from "@/components/DatePickerButton";
import { useRequiredCoursesContext } from "@/utils/storage/requiredCoursesContext";
import CourseCard from "@/components/CourseCard";
import { useCourseContext } from "@/utils/storage/courseContext";
import { useState } from "react";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";

export default function CreateCoursePage() {
    const theme = useTheme();
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const courseContext = useCourseContext();
    const courseDetailsHook = useCourseDetails();
    const requiredCoursesContext = useRequiredCoursesContext();
    const courseDetails = courseDetailsHook.courseDetails;
    const { requiredCourses } = requiredCoursesContext;


    if (!courseContext.course) {
        router.push("/home"); // TODO redireccionar a la página de error
        return null;
    }

    const courseContextData = courseContext.course;

    courseDetailsHook.setCourseDetails({ ...courseContextData.courseDetails });


    const handleDiscardChanges = () => {
        courseDetailsHook.setCourseDetails({ ...courseContextData.courseDetails });
        setIsEditing(false);
    };

    const handleEditCourse = async () => {
        setIsLoading(true);
        try {
            await editCourse(courseDetails);
            setIsEditing(false);
        } catch (error) {
            setErrorMessage((error as Error).message);
        } finally {
            setIsLoading(false);
        }

    };

    const handleRequiredCoursePress = () => {
        router.push("/home"); // TODO redireccionar a la página del curso requerido
    };

    return (
        <>
            <Appbar.Header>
                <Appbar.BackAction onPress={isEditing ? () => handleDiscardChanges() : () => router.back()} />
                <Appbar.Content title="Crear curso" />
                <Appbar.Action
                    icon={isEditing ? "check" : "pencil"}
                    onPress={isEditing ? handleEditCourse : () => setIsEditing(!isEditing)}
                />
            </Appbar.Header>
            <View
                style={[
                    globalStyles.mainContainer,
                    { backgroundColor: theme.colors.background },
                ]}
            >
                <ScrollView contentContainerStyle={globalStyles.courseDetailsContainer}>
                    <TextInput
                        placeholder="Nombre del curso"
                        onChangeText={courseDetailsHook.setName}
                    />
                    <TextInput
                        placeholder="Descripción del curso"
                        onChangeText={courseDetailsHook.setDescription}
                    />

                    <Text>Cantidad máxima de alumnos</Text>


                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            gap: 20,
                        }}
                    >
                        <DatePickerButton
                            label="Fecha de inicio"
                            value={courseDetails.startDate}
                            onChange={courseDetailsHook.setStartDate}
                        />
                        <DatePickerButton
                            label="Fecha de finalización"
                            value={courseDetails.endDate}
                            onChange={courseDetailsHook.setEndDate}
                        />
                    </View>
                    <OptionPicker
                        label="Nivel"
                        value={courseDetails.level}
                        items={levels}
                        setValue={courseDetailsHook.setLevel}
                    />

                    <OptionPicker
                        label="Categoría"
                        value={courseDetails.category}
                        items={categories}
                        setValue={courseDetailsHook.setCategory}
                    />

                    <OptionPicker
                        label="Modalidad"
                        value={courseDetails.modality}
                        items={modalities}
                        setValue={courseDetailsHook.setModality}
                    />
                    <View style={{ gap: 10 }}>
                        <Text variant="titleMedium">Cursos requeridos</Text>
                        {requiredCourses.map((course) => (
                            <View
                                key={course.courseId}
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 10,
                                }}
                            >
                                <CourseCard
                                    name={course.courseDetails.title}
                                    category={course.courseDetails.category}
                                    onPress={handleRequiredCoursePress}
                                />
                                <IconButton
                                    icon="delete"
                                    mode="contained"
                                    onPress={() => {
                                        requiredCoursesContext.deleteRequiredCourse(course);
                                    }}
                                />
                            </View>
                        ))}
                        <Button
                            onPress={() => router.push("/courses/create/searchRequired")}
                            mode="outlined"
                            icon="plus"
                        >
                            Agregar curso requerido
                        </Button>
                    </View>

                    {!isEditing && (
                        <Button
                            mode="contained"
                            onPress={handleEditCourse}
                            disabled={isLoading}
                            style={{ marginTop: 20 }}
                        >
                            Editar curso
                        </Button>
                    )}
                </ScrollView>
                <ErrorMessageSnackbar
                    message={errorMessage}
                    onDismiss={() => setErrorMessage("")}
                />
            </View>
        </>
    );
}
