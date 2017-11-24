require 'erb'
require 'date'
require 'rest-client'
require 'json'

require 'pp'

# being logged in is unstated precondition for many functions

# @param fname -> valid erb file located in src/ directory
# @return      -> rendered HTML from file
def render_erb(fname)
  ERB.new(
    File.read("src/#{fname}.erb")
  ).result(binding)
end

# @return -> fully formatted markdown post
def reddit_post # rubocop:disable MethodLength
  "[](/# MC // let time = #{session[:time] || 'null'})\n" \
  "[](/# MC // let launch = #{session[:launch] || 'null'})\n" \
  "[](/# MC // let video = #{session[:video] || 'null'})\n\n" \
  \
  "[](/# MC // section intro)\n" \
  "#{session[:intro]}\n\n" \
  \
  '[](/# MC // section events)' \
  "#{if session[:events]
       "#{format_unposted_events session[:events]}\n" \
       "### Live Updates\n" \
       "#{format_posted_events session[:events]}"
     end}\n\n" \
  \
  "[](/# MC // section viewing)\n" \
  "#{session[:viewing]}\n\n" \
  \
  "[](/# MC // section stats)\n" \
  "#{session[:stats]}\n\n" \
  \
  "[](/# MC // section mission)\n" \
  "#{session[:mission]}\n\n" \
  \
  "[](/# MC // section landing)\n" \
  "#{session[:landing]}\n\n" \
  \
  "[](/# MC // section resources)\n" \
  "#{session[:resources]}\n\n" \
  \
  "[](/# MC // section participate)\n" \
  "#{session[:participate]}\n\n" \
  \
  '[](/# MC // section END)'
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
  puts session[:take]

  title = "r/SpaceX #{session[:launch]} Official Launch Discussion & " \
          "Updates Thread#{", Take #{session[:take]}" if session[:take]}"

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
# @return       -> formatted markdown table of posted events
def format_posted_events(events)
  return if events.nil?
  str = "| Time | Update |\n" \
        '| --- | --- |'

  row = -1
  events.each do |posted, time, message|
    next if message == '' # must have message to count as row
    row += 1
    next unless posted # must be posted
    str += "\n| [](/# MC // row #{row}) #{time} | #{message} |"
  end
  str
end

# @param events -> array of all events (is_posted, T± time, message)
# @return       -> formatted comments of unposted events
def format_unposted_events(events)
  return if events.nil?
  str = ''

  row = -1
  events.each do |posted, time, message|
    next if message == '' # must have message to count as row
    row += 1
    next if posted # must be unposted
    str += "\n[](/# MC // row #{row} | #{time.gsub(')', '\)')} | " \
           "#{message.gsub(')', '\)')} |)"
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
  api_endpoint = 'https://api.spacexdata.com/v2/launches/upcoming'
  resp = RestClient.get api_endpoint, params

  # read data from API, reformat to hash of mission -> launch time
  launches = {}
  JSON.parse(resp.body).each do |obj|
    payload = obj['rocket']['second_stage']['payloads'][0]['payload_id']
    payload = payload[7..-1] if payload.start_with? 'SpaceX ' # CRS missions
    launches[payload] = obj['launch_date_unix']
  end
  launches
end
