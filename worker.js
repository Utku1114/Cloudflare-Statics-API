addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  let today = new Date();

  
  let todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), today.getMinutes(), 0);
  console.log(todayDateOnly.toISOString());

  let yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);


  let yesterdayDateOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0);
  console.log(yesterdayDateOnly.toISOString())

  const url = 'https://api.cloudflare.com/client/v4/graphql'; //Cloudflare graphql api endpoint
  const zoneTag = "YOUR-ZONE-TAG"; // Replace with your actual zone tag
  const startDate = new Date(yesterdayDateOnly.toISOString()); // Replace with your start date
  const endDate = new Date(todayDateOnly.toISOString()); // Replace with your end date
  const token = "YOUR-API-TOKEN"; // Replace with your actual token

  // Function to generate GraphQL query for each hour
  function generateHourlyQuery(date) {
    const isoDate = date.toISOString();
    const safeIsoDate = isoDate.replace(/[:\-T.Z]/g, '_'); // Replace invalid characters for GraphQL field names
    return `
      hour_${safeIsoDate}: httpRequests1hGroups(limit: 1000, filter: {datetime: "${isoDate}"}) {
        dimensions {
          datetime
        }
        uniq {
					uniques
				}
        sum {
          requests
          cachedRequests
          bytes
          cachedBytes
        }
      }
    `;
  }

  // Generate hourly queries for each hour between startDate and endDate
  let hourlyQueries = '';
  let currentHour = new Date(startDate);
  while (currentHour < endDate) {
    hourlyQueries += generateHourlyQuery(currentHour);
    currentHour.setHours(currentHour.getHours() + 1); // Move to the next hour
  }

  // Final GraphQL query combining all hourly queries
  const query = `
    query {
      viewer {
        zones(filter: {zoneTag: "${zoneTag}"}) {
          ${hourlyQueries}
        }
      }
    }
  `;


  const init = {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR-API-TOKEN',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  }

  const response = await fetch(url, init)
  const results = await response.json()

  return new Response(JSON.stringify(results), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  })
}
