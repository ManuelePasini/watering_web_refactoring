import { Model, ModelStatic, WhereOptions } from 'sequelize';

export const _deleteFromModelByParams = async <T extends Model>(
    model: ModelStatic<T>,
    where: WhereOptions<T['_attributes']>
): Promise<number[]> => {
    const rows = await model.findAll({
        where,
        attributes: ['id'],
        raw: true
    });

    const ids = (rows as unknown as {id: number}[]).map(row => row.id);

    await model.destroy({
        where
    });

    return ids;
};