import { createModuleRequest } from "@/api/modules";
import { Module, ModuleDetails } from "@/types/resources";
import { handleError } from "./errorHandling";
import { moduleSchema } from "@/validations/resources";

export async function getCourseModules(courseId: string): Promise<Module[]> {
  try {
    const request = await createModuleRequest(courseId);
    const response = await request.get("");
    const modulesData = response.data.data;

    const modules: Module[] = modulesData.map(
      (moduleData: any) =>
        new Module(
          moduleData.module_id,
          moduleData.course_id,
          new ModuleDetails(moduleData.title, moduleData.description)
        )
    );

    return modules;
  } catch (error) {
    throw handleError(error, "obtener los módulos del curso");
  }
}

export async function getCourseModule(
  courseId: string,
  moduleId: number
): Promise<Module> {
  try {
    const request = await createModuleRequest(courseId);
    const response = await request.get(`/${moduleId}`);
    const moduleData = response.data.data;

    const module = new Module(
      moduleData.module_id,
      moduleData.course_id,
      new ModuleDetails(moduleData.title, moduleData.description)
    );

    return module;
  } catch (error) {
    throw handleError(error, "obtener el módulo del curso");
  }
}

export async function createCourseModule(
  courseId: string,
  moduleDetails: ModuleDetails
): Promise<Module> {
  try {
    moduleSchema.parse(moduleDetails);
    const body = {
      title: moduleDetails.title,
      description: moduleDetails.description,
    };

    const request = await createModuleRequest(courseId);
    const response = await request.post("", body);
    const moduleData = response.data.data;

    const module = new Module(
      moduleData.module_id,
      moduleData.course_id,
      new ModuleDetails(moduleData.title, moduleData.description)
    );

    return module;
  } catch (error) {
    throw handleError(error, "crear un módulo del curso");
  }
}
