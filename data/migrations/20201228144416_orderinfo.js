exports.up = function (knex) {
  return knex.schema.createTable("orderinfo", (table) => {
    table.increments("id").primary();
    table.string("customer_name").notNullable();
    table
      .integer("outletvenuemenu_id")
      .references("outletvenuemenus.id")
      .onDelete("CASCADE");
    table
      .integer("outleteventmenu_id")
      .references("outleteventmenus.id")
      .onDelete("CASCADE");
    table.integer("men_count").notNullable();
    table.string("men_age_group").notNullable();
    table.integer("women_count").notNullable();
    table.string("woment_age_group").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = function (knex) {};
