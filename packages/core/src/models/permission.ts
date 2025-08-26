import zod from 'zod'

export const permissionSchema = zod.object({
  workspaceId: zod.string(),
  workspaceName: zod.string()
})

export type Permission = zod.infer<typeof permissionSchema>
