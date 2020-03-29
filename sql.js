var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('./gold_medals.sqlite');

/*
Returns a SQL query string that will create the Country table with four columns: name (required), code (required), gdp, and population.
*/

const createCountryTable = () => {
  return `CREATE TABLE Country (
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    gdp INTEGER,
    population INTEGER
  );`;
};

/*
Returns a SQL query string that will create the GoldMedal table with ten columns (all required): id, year, city, season, name, country, gender, sport, discipline, and event.
*/

const createGoldMedalTable = () => {
  return `CREATE TABLE GoldMedal (
    year INTEGER NOT NULL,
    name TEXT NOT NULL,
    event TEXT NOT NULL,
    gender TEXT NOT NULL,
    sport TEXT NOT NULL,
    discipline TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    season TEXT NOT NULL
  );`;
};

/*
Returns a SQL query string that will find the number of gold medals for the given country.
*/

const goldMedalNumber = (country) => {
  return `
      SELECT COUNT(*)
      FROM GoldMedal
      WHERE country = '${country}'
      GROUP BY country;
      `;
};
/*
Returns a SQL query string that will find the year where the given country 
won the most summer medals, along with the number of medals aliased to 'count'.
*/

const mostSeasonWins = (season, country) => {
  return !['Summer', 'Winter'].includes(season)
    ? null
    : `
    SELECT year, COUNT(*)
    FROM GoldMedal
    WHERE season = '${season}' AND country = '${country}'
    GROUP BY year
    ORDER BY COUNT(*) desc
    LIMIT 1;
    `;
};

const mostSummerWins = (country) => {
  return mostSeasonWins('Summer', country);
};

/*
Returns a SQL query string that will find the year where the given country won the most winter medals, along with the number of medals aliased to 'count'.
*/

const mostWinterWins = (country) => {
  return mostSeasonWins('Winter', country);
};

/*
Returns a SQL query string that will find the year where the given country  won the most medals, along with the number of medals aliased to 'count'.
*/

const countryBestWithCount = (bestThing, country) => {
  return !['year', 'discipline', 'sport', 'event'].includes(bestThing)
    ? null
    : `
      SELECT ${bestThing},
      COUNT(*) as count
      FROM GoldMedal
      WHERE country = '${country}'
      GROUP BY country, ${bestThing}
      ORDER BY count desc
      LIMIT 1;
      `;
};

const bestYear = (country) => countryBestWithCount('year', country);

/*
Returns a SQL query string that will find the discipline this country has won the most medals, along with the number of medals aliased to 'count'.
*/

const bestDiscipline = (country) => countryBestWithCount('discipline', country);

/*
Returns a SQL query string that will find the sport this country has 
won the most medals, along with the number of medals aliased to 'count'.
*/

const bestSport = (country) => countryBestWithCount('sport', country);

/*
Returns a SQL query string that will find the event this country has 
won the most medals, along with the number of medals aliased to 'count'.
*/

const bestEvent = (country) => countryBestWithCount('event', country);

/*
Returns a SQL query string that will find the number of male medalists.
*/

const numberGenderMedalist = (gender, country) => {
  return !['Men', 'Women'].includes(gender)
    ? null
    : `SELECT COUNT(DISTINCT name) as count
      FROM GoldMedal
      WHERE country = '${country}'
      AND gender = '${gender}';`;
};

const numberMenMedalists = (country) => numberGenderMedalist('Men', country);

/*
Returns a SQL query string that will find the number of female medalists.
*/

const numberWomenMedalists = (country) => numberGenderMedalist('Women', country);

/*
Returns a SQL query string that will find the athlete with the most medals.
*/

const mostMedaledAthlete = (country) => {
  return `
    SELECT name
    FROM GoldMedal
    WHERE country = '${country}'
    GROUP BY name
    ORDER BY Count(*) DESC
    LIMIT 1;
    `;
};

/*
Returns a SQL query string that will find the medals a country has won
optionally ordered by the given field in the specified direction.
*/

const orderedMedals = (country, field, sortAscending) => {
  return `
    SELECT *
    FROM GoldMedal
    WHERE country = '${country}'
    ${
      !field
        ? ''
        : `ORDER BY ${field} ${
            typeof sortAscending === 'undefined' || sortAscending === false
              ? 'DESC'
              : 'ASC'
          }`
    }
    `;
};

/*
Returns a SQL query string that will find the sports a country has
won medals in. It should include the number of medals, aliased as 'count',
as well as the percentage of this country's wins the sport represents,
aliased as 'percent'. Optionally ordered by the given field in the specified direction.
*/

const orderedSports = (country, field, sortAscending) => {
  let orderingString = '';
  if (field) {
    if (sortAscending) {
      orderingString = `ORDER BY ${field} ASC`;
    } else {
      orderingString = `ORDER BY ${field} DESC`;
    }
  }
  return `
    SELECT sport,
    COUNT(sport) as count,
    (COUNT(sport) * 100 / (SELECT COUNT(*) FROM GoldMedal WHERE country = '${country}')) AS percent
    FROM GoldMedal
    WHERE country = '${country}'
    GROUP BY sport
    ${orderingString};
    `;
};

module.exports = {
  createCountryTable,
  createGoldMedalTable,
  goldMedalNumber,
  mostSummerWins,
  mostWinterWins,
  bestDiscipline,
  bestSport,
  bestYear,
  bestEvent,
  numberMenMedalists,
  numberWomenMedalists,
  mostMedaledAthlete,
  orderedMedals,
  orderedSports,
};
