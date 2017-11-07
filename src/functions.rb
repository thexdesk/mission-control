require 'erb'
require 'date'
require 'rest-client'
require 'json'

# being logged in is unstated precondition for many functions

# @param fname -> valid erb file located in src/ directory
# @return      -> rendered HTML from file
def render_erb(fname)
  ERB.new(
    File.read("src/#{fname}.erb")
  ).result(binding)
end

# @return -> fully formatted markdown post
def reddit_post
  "[](/# MC // let time = #{session[:time] || 'null'})\n" \
  "[](/# MC // let launch = #{session[:launch] || 'null'})\n" \
  "[](/# MC // let video = #{session[:video] || 'null'})\n" \
  "[](/# MC // END VARS)\n\n" \
  \
  "[](/# MC // INTRO)\n" \
  "#{session[:intro]}\n\n" \
  \
  "[](/# MC // EVENTS)\n" \
  "#{if session[:events]
       "### Live Updates\n" \
       "#{format_events session[:events]}"
     end}" \
  \
  "[](/# MC // VIEWING)\n" \
  "#{session[:viewing]}\n\n" \
  \
  "[](/# MC // STATS)\n" \
  "#{session[:stats]}\n\n" \
  \
  "[](/# MC // MISSION)\n" \
  "#{session[:mission]}\n\n" \
  \
  "[](/# MC // LANDING)\n" \
  "#{session[:landing]}\n\n" \
  \
  "[](/# MC // RESOURCES)\n" \
  "#{session[:resources]}\n\n" \
  \
  "[](/# MC // PARTICIPATE)\n" \
  "#{session[:participate]}\n\n" \
  \
  '[](/# MC // END)'
end

# @param id -> id of reddit post
# @return   -> hash of post score, number of comments, HTML
def post_info(id)
  submission = request.env['redd.session'].from_ids ["t3_#{id}"].to_ary
  {
    'score' => submission[0].score,
    'num_comments' => submission[0].num_comments,
    'html' => submission[0].selftext_html
  }
end

# @precondition  -> subreddit is set in environment variable
# @param title   -> title of the post
# @param text    -> content of the post (default empty)
# @postcondition -> self post is created in given subreddit
def make_post(title, text = '')
  request
    .env['redd.session']
    .subreddit(ENV['SUBREDDIT'])
    .submit title,
      text: text,
      sendreplies: false
end

# @precondition      -> post exists and is set in session variable
# @param create_only -> are we just creating the post, or do we have content?
# @postcondition     -> post created if it didn't exist
# @postcondition     -> content inserted into post if create_only == false
def update_post(create_only = false)
  title = "r/SpaceX #{session[:launch]} Official Launch Discussion & " \
          'Updates Thread'

  # post doesn't exist, create with no content
  if create_only && session[:post].nil?
    post = make_post title
    session[:post] = post.id

  # post doesn't exist, create with content
  elsif session[:post].nil?
    post = make_post title, reddit_post
    session[:post] = post.id

  # post exists, update content
  else
    post = request.env['redd.session'].from_ids ["t3_#{session[:post]}"]
    post[0].edit reddit_post
  end

  post_info(session[:post])['html']
end

# @param events -> array of all events (is_posted, T± time, message)
# @return       -> formatted markdown table of events
def format_events(events)
  return if events.nil?
  str = "| Time | Update |\n" \
        '| --- | --- |'
  events.each do |event|
    next if event[2] == '' || !event[0] # must have message and be "posted"
    str += "\n| #{event[1]} | #{event[2]} |"
  end
  str
end

# @precondition -> Jake doesn't break the API
# @return       -> hash of all launches (with time) within the next 7 days
def upcoming_launches
  d = Date.today
  today = d.to_s
  one_week = (d + 7).to_s

  params = {
    params: {
      start: today,
      final: one_week
    }
  }
  api_endpoint = 'https://api.spacexdata.com/v1/launches/upcoming'
  resp = RestClient.get api_endpoint, params

  # read data from API, reformat to hash of mission -> launch time
  launches = {}
  JSON.parse(resp.body).each do |obj|
    payload = obj['payloads'][0]['payload_id']
    payload = payload[7..-1] if payload.start_with? 'SpaceX ' # CRS missions
    launches[payload] = DateTime.parse(obj['launch_date_utc']).strftime('%s')
  end
  launches
end
