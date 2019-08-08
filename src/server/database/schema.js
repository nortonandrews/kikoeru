/* eslint-disable no-console */
const { knex } = require('./db');

const createSchema = () => knex.schema
  .createTable('t_circle', (table) => {
    table.increments();
    table.string('name').notNullable();
  })
  .createTable('t_work', (table) => {
    table.increments();
    table.string('dir').notNullable();
    table.string('title').notNullable();
    table.integer('circle_id').notNullable();
    table.boolean('nsfw').notNullable();
    table.foreign('circle_id').references('id').inTable('t_circle');
  })
  .createTable('t_tag', (table) => {
    table.increments();
    table.string('name').notNullable();
  })
  .createTable('t_va', (table) => {
    table.increments();
    table.string('name').notNullable();
  })

  .createTable('r_tag_work', (table) => {
    table.integer('tag_id');
    table.integer('work_id');
    table.foreign('tag_id').references('id').inTable('t_tag');
    table.foreign('work_id').references('id').inTable('t_work');
    table.primary(['tag_id', 'work_id']);
  })
  .createTable('r_va_work', (table) => {
    table.integer('va_id');
    table.integer('work_id');
    table.foreign('va_id').references('id').inTable('t_va');
    table.foreign('work_id').references('id').inTable('t_work');
    table.primary(['va_id', 'work_id']);
  })
  .then(() => {
    console.log(' * Schema created.');
  })
  .catch((err) => {
    // ew
    if (err.toString().indexOf('table `t_circle` already exists') !== -1) {
      console.log(' * Schema already exists.');
    } else {
      throw new Error(` ! ERROR while creating schema: ${err}`);
    }
  });

module.exports = { createSchema };
