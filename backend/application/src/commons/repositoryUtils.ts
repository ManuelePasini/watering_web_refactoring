type ModelWithDelete = {
  findAll(args: { where: Record<string, unknown>, attributes: string[], raw: true }): Promise<Array<{ id: number }>>
  destroy(args: { where: Record<string, unknown> }): Promise<unknown>
}

export const _deleteFromModelByParams = async (model: ModelWithDelete, where: Record<string, unknown>): Promise<number[]> => {
  const rows = await model.findAll({
    where,
    attributes: ['id'],
    raw: true
  })
  const ids = rows.map(row => row.id)
  await model.destroy({
    where
  })
  return ids
}
