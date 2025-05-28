import {
  createModuleRequest,
  createModulesRequest,
  createOrderModulesRequest,
} from "@/api/modules";
import {
  Attachment,
  Module,
  ModuleDetails,
  Resource,
  ResourceDetails,
} from "@/types/resources";
import {
  getAttachmentFromBackend,
  handleError,
  syncResourceAttachments,
} from "./common";
import { moduleSchema, resourceDetailsSchema } from "@/validations/resources";
import { createResourceRequest, createResourcesRequest } from "@/api/resources";
import { createOrderResourcesRequest } from "@/api/resources";

export async function getModules(courseId: string): Promise<Module[]> {
  try {
    const request = await createModulesRequest(courseId);
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

export async function getModule(
  courseId: string,
  moduleId: number
): Promise<Module> {
  try {
    const request = await createModuleRequest(courseId, moduleId);
    const response = await request.get("");
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

export async function createModule(
  courseId: string,
  moduleDetails: ModuleDetails
): Promise<Module> {
  try {
    moduleSchema.parse(moduleDetails);
    const body = {
      title: moduleDetails.title,
      description: moduleDetails.description,
    };

    const request = await createModulesRequest(courseId);
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

export async function updateModule(
  courseId: string,
  moduleId: number,
  moduleDetails: ModuleDetails
): Promise<Module> {
  try {
    moduleSchema.parse(moduleDetails);
    const body = {
      title: moduleDetails.title,
      description: moduleDetails.description,
    };

    const request = await createModuleRequest(courseId, moduleId);
    const response = await request.patch("", body);
    const moduleData = response.data.data;

    const module = new Module(
      moduleData.module_id,
      moduleData.course_id,
      new ModuleDetails(moduleData.title, moduleData.description)
    );

    return module;
  } catch (error) {
    throw handleError(error, "actualizar el módulo del curso");
  }
}

export async function deleteModule(
  courseId: string,
  moduleId: number
): Promise<void> {
  try {
    const request = await createModuleRequest(courseId, moduleId);
    await request.delete("");
  } catch (error) {
    throw handleError(error, "eliminar el módulo del curso");
  }
}

export async function orderModules(
  courseId: string,
  moduleIds: number[]
): Promise<void> {
  try {
    const body = {
      ids: moduleIds,
    };

    const request = await createOrderModulesRequest(courseId);
    await request.post("", body);
  } catch (error) {
    throw handleError(error, "ordenar los módulos del curso");
  }
}

export async function getResources(
  courseId: string,
  moduleId: number
): Promise<Resource[]> {
  try {
    const request = await createResourcesRequest(courseId, moduleId);
    const response = await request.get("");
    const resourcesData = response.data.data;

    const resources = resourcesData.map(
      (resourceData: any) =>
        new Resource(
          resourceData.learning_resource_id,
          new ResourceDetails(
            resourceData.title,
            resourceData.module_id,
            resourceData.description,
            []
          )
        )
    );

    return resources;
  } catch (error) {
    throw handleError(error, "obtener los recursos del curso");
  }
}

export async function getResource(
  courseId: string,
  moduleId: number,
  resourceId: number
): Promise<Resource> {
  try {
    const request = await createResourceRequest(courseId, moduleId, resourceId);
    const response = await request.get("");
    const resourceData = response.data.data;

    const resource = new Resource(
      resourceData.learning_resource_id,
      new ResourceDetails(
        resourceData.title,
        resourceData.module_id,
        resourceData.description,
        resourceData.attachments.map((attachment: any) =>
          getAttachmentFromBackend(attachment)
        )
      )
    );

    console.log(
      "Resource fetched attachments:",
      resource.resourceDetails.attachments
    );

    return resource;
  } catch (error) {
    throw handleError(error, "obtener los recursos del curso");
  }
}

export async function createResource(
  courseId: string,
  moduleId: number,
  resourceDetails: ResourceDetails
): Promise<Resource> {
  try {
    resourceDetailsSchema.parse(resourceDetails);

    const body = {
      title: resourceDetails.title,
      description: resourceDetails.description,
    };

    const request = await createResourcesRequest(courseId, moduleId);
    const response = await request.post("", body);
    const resourceData = response.data.data;

    const resource = new Resource(
      resourceData.learning_resource_id,
      resourceDetails
    );

    // Subir archivos adjuntos si existen
    if (resourceDetails.attachments && resourceDetails.attachments.length > 0) {
      await syncResourceAttachments(
        courseId,
        moduleId,
        resource.resourceId,
        resourceDetails.attachments,
        []
      );
    }

    return resource;
  } catch (error) {
    throw handleError(error, "crear un recurso del curso");
  }
}

export async function updateResource(
  courseId: string,
  moduleId: number,
  resourceId: number,
  resourceDetails: ResourceDetails,
  originalAttachments: Attachment[]
): Promise<Resource> {
  try {
    resourceDetailsSchema.parse(resourceDetails);
    const body = {
      title: resourceDetails.title,
      description: resourceDetails.description,
    };

    const request = await createResourceRequest(courseId, moduleId, resourceId);
    const response = await request.patch("", body);
    const resourceData = response.data.data;

    const resource = new Resource(
      resourceData.learning_resource_id,
      resourceDetails
    );

    // Sincronizar adjuntos usando la función utilitaria
    if (resourceDetails.attachments && resourceDetails.attachments.length > 0) {
      await syncResourceAttachments(
        courseId,
        moduleId,
        resource.resourceId,
        resourceDetails.attachments,
        originalAttachments
      );
    }

    return resource;
  } catch (error) {
    throw handleError(error, "actualizar un recurso del curso");
  }
}

export async function deleteResource(
  courseId: string,
  moduleId: number,
  resourceId: number
): Promise<void> {
  try {
    const request = await createResourceRequest(courseId, moduleId, resourceId);
    await request.delete("");
  } catch (error) {
    throw handleError(error, "eliminar un recurso del curso");
  }
}

export async function orderResources(
  courseId: string,
  moduleId: number,
  resourceIds: number[]
): Promise<void> {
  try {
    const body = { ids: resourceIds };
    const request = await createOrderResourcesRequest(courseId, moduleId);
    await request.post("", body);
  } catch (error) {
    throw handleError(error, "ordenar los recursos del módulo");
  }
}
